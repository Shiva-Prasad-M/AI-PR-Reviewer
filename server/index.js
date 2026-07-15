const express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Verify GitHub webhook signature
function verifyGitHubSignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return signature === `sha256=${hash}`;
}

// Generate AI review using OpenAI
async function generateAIReview(prContent) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer. Provide constructive feedback on pull requests.',
          },
          {
            role: 'user',
            content: `Review this pull request changes:\n\n${prContent}\n\nProvide specific feedback on:\n1. Code quality\n2. Best practices\n3. Potential bugs\n4. Performance concerns\n5. Security issues`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI review:', error);
    return 'Unable to generate AI review at this moment.';
  }
}

// Main webhook endpoint
app.post('/webhook', async (req, res) => {
  // Verify webhook signature
  if (!verifyGitHubSignature(req, process.env.GITHUB_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, pull_request } = req.body;

  if (!pull_request) {
    return res.status(200).json({ message: 'Not a PR event' });
  }

  try {
    // Only process when PR is opened or synchronize (new commits)
    if (action === 'opened' || action === 'synchronize') {
      const { owner, repo, number, title, body } = pull_request;

      console.log(`Processing PR #${number} in ${owner.login}/${repo.name}`);

      // Get PR diff
      const prDiff = await octokit.pulls.get({
        owner: owner.login,
        repo: repo.name,
        pull_number: number,
        mediaType: { format: 'diff' },
      });

      // Generate AI review
      const prContent = `Title: ${title}\nDescription: ${body}\n\nChanges:\n${prDiff.data}`;
      const review = await generateAIReview(prContent);

      // Post review as PR comment
      await octokit.issues.createComment({
        owner: owner.login,
        repo: repo.name,
        issue_number: number,
        body: `## 🤖 AI Review\n\n${review}`,
      });

      console.log(`Review posted for PR #${number}`);
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI PR Reviewer server running on port ${PORT}`);
});

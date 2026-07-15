# AI-PR-Reviewer 🤖

An intelligent GitHub Pull Request reviewer powered by OpenAI's GPT models. This bot automatically analyzes PRs and provides constructive feedback on code quality, best practices, potential bugs, and security concerns.

## Features

✅ **Automated Code Review** - AI-powered analysis of pull request changes  
✅ **Constructive Feedback** - Identifies bugs, performance issues, and security concerns  
✅ **GitHub Integration** - Seamlessly posts reviews as PR comments  
✅ **Real-time Processing** - Processes PRs as they're opened or updated  
✅ **Best Practices** - Evaluates code against industry standards  

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **GitHub Personal Access Token** with `repo` scope
- **OpenAI API Key** (GPT-3.5 or GPT-4)
- **A GitHub repository** to test with

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Shiva-Prasad-M/AI-PR-Reviewer.git
cd AI-PR-Reviewer
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
OPENAI_API_KEY=sk-your_openai_key_here
PORT=3000
```

### Getting Your Tokens

#### GitHub Personal Access Token
1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scopes: `repo`, `webhook`
4. Copy and paste into `.env`

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste into `.env`

## Setup GitHub Webhook

### 1. Deploy Your Server

Deploy this server to a publicly accessible URL. Options:
- **Heroku**, **Railway**, **Vercel**, **AWS Lambda**, etc.
- Or use **ngrok** for local testing: `ngrok http 3000`

### 2. Configure Webhook in GitHub

1. Go to your repository → **Settings → Webhooks**
2. Click **Add webhook**
3. Set **Payload URL** to: `https://your-domain.com/webhook`
4. Set **Content type** to: `application/json`
5. Set **Secret** to your `GITHUB_WEBHOOK_SECRET`
6. Select events: **Pull requests**
7. Click **Add webhook**

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## How It Works

```
1. Developer creates/updates a PR
   ↓
2. GitHub sends webhook event to your server
   ↓
3. Server fetches PR diff and metadata
   ↓
4. OpenAI analyzes the changes
   ↓
5. AI-generated review posted as PR comment
   ↓
6. Developer receives constructive feedback
```

## API Endpoints

### POST `/webhook`
GitHub webhook endpoint for PR events.

**Headers:**
- `X-Hub-Signature-256`: Webhook signature (auto-verified)

**Body:** GitHub pull request event payload

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "Server is running"
}
```

## Configuration Options

In `server/index.js`, you can customize:

- **Model**: Change from `gpt-3.5-turbo` to `gpt-4` for better reviews
- **Review Criteria**: Modify the system prompt for different review focus
- **Max Tokens**: Adjust `max_tokens` for longer/shorter reviews
- **Temperature**: Adjust `temperature` for review creativity

## Troubleshooting

### Webhook Not Being Triggered
- Verify webhook URL is publicly accessible
- Check GitHub webhook delivery logs (Settings → Webhooks → Recent Deliveries)
- Ensure webhook secret matches in `.env`

### Review Not Posted
- Check OpenAI API key validity
- Verify GitHub token has `repo` scope
- Check server logs for errors
- Ensure PR has commits

### "Unauthorized" Error
- Webhook signature verification failed
- Check that `GITHUB_WEBHOOK_SECRET` matches GitHub settings

### API Rate Limits
- OpenAI: Check usage at platform.openai.com
- GitHub: Token has rate limits, consider using organization PAT

## Security Considerations

⚠️ **Never commit `.env` file** - Always add to `.gitignore`  
🔐 **Rotate tokens regularly** - Update GitHub token and OpenAI key  
🔒 **Use HTTPS** - Always deploy over secure connections  
✅ **Verify webhooks** - Always verify webhook signatures  

## Customization Examples

### Use Different AI Model
```javascript
model: 'gpt-4', // Change to GPT-4 for advanced reviews
```

### Custom Review Focus
```javascript
content: 'Review this PR focusing on security vulnerabilities and performance optimization.',
```

### Add Multiple Review Comments
```javascript
// Post separate comments for different categories
await octokit.issues.createComment({ /* ... */ });
await octokit.issues.createComment({ /* ... */ });
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

ISC License - See LICENSE file for details

## Support

For issues and questions:
- 📖 Check the [GitHub Issues](https://github.com/Shiva-Prasad-M/AI-PR-Reviewer/issues)
- 💬 Create a new issue with details

---

**Made with ❤️ by Shiva-Prasad-M**

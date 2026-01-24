# 🚀 Sean's API Gateway

A central API proxy for all your apps. Keeps your API keys secure on the server.

---

## Quick Start

### 1. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
cd sean-api-gateway
vercel
```

Or connect GitHub repo to Vercel for auto-deploys.

### 2. Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxxxx` |
| `WOOLLY_LOOPS_SECRET` | `your-secret-here` |

### 3. You're Live!

```
https://your-project.vercel.app/api/health
```

---

## Endpoints

### `GET /api/health`
Health check. Returns status and available endpoints.

### `POST /api/anthropic`
Universal Anthropic proxy. Pass through any Anthropic API request.

**Headers:**
- `x-app-id`: Your app identifier (e.g., `woolly-loops`)
- `x-app-secret`: The secret for that app

**Body:** Standard Anthropic messages API body

### `POST /api/woolly-loops/generate`
Woolly Loops specific endpoint with kid-friendly system prompt built in.

**Headers:**
- `x-app-secret`: Your Woolly Loops secret

**Body:**
```json
{
  "prompt": "A cute bunny for beginners",
  "image": {
    "data": "base64-string",
    "mediaType": "image/jpeg"
  }
}
```

---

## Using in Your Apps

### Woolly Loops (React Native)

```typescript
const API_URL = 'https://your-project.vercel.app';
const APP_SECRET = 'your-woolly-loops-secret';

export async function generatePattern(prompt: string) {
  const response = await fetch(`${API_URL}/api/woolly-loops/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': APP_SECRET,
    },
    body: JSON.stringify({ prompt }),
  });
  
  const { pattern } = await response.json();
  return pattern;
}
```

### Generic Anthropic Call (Any App)

```typescript
const API_URL = 'https://your-project.vercel.app';

export async function callClaude(messages: any[], appId: string, appSecret: string) {
  const response = await fetch(`${API_URL}/api/anthropic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id': appId,
      'x-app-secret': appSecret,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages,
    }),
  });
  
  return response.json();
}
```

---

## Adding New Apps

1. Add a new secret in Vercel environment variables:
   ```
   MY_NEW_APP_SECRET=some-random-string
   ```

2. Add it to `api/anthropic.js`:
   ```javascript
   const APP_SECRETS = {
     'woolly-loops': process.env.WOOLLY_LOOPS_SECRET,
     'my-new-app': process.env.MY_NEW_APP_SECRET,  // Add this
   };
   ```

3. (Optional) Create app-specific endpoint:
   ```
   api/my-new-app/endpoint.js
   ```

---

## Project Structure

```
sean-api-gateway/
├── api/
│   ├── health.js              # Health check
│   ├── anthropic.js           # Universal Anthropic proxy
│   └── woolly-loops/
│       └── generate.js        # Woolly Loops specific
├── vercel.json                # Vercel config
├── package.json
├── .env.example
└── README.md
```

---

## Security

- ✅ API keys stored in Vercel environment (never in code)
- ✅ Per-app secrets prevent unauthorized access
- ✅ CORS headers configured
- ✅ Edge runtime for low latency globally

---

## Cost

Vercel free tier includes:
- 100GB bandwidth/month
- 100,000 function invocations/month
- Serverless functions up to 10 seconds

This is more than enough for indie apps. You only pay for Anthropic API usage.

---

Made with ☕ by Sean

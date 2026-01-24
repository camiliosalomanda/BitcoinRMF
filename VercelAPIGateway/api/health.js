// api/health.js
// Simple health check endpoint

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'Sean API Gateway',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/anthropic - Universal Anthropic proxy',
      'POST /api/woolly-loops/generate - Woolly Loops pattern generator',
    ],
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

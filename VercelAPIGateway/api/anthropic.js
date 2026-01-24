// api/anthropic.js
// Universal Anthropic API proxy for all your apps

export const config = {
  runtime: 'edge',
};

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// App secrets - add more as you build more apps
const APP_SECRETS = {
  'woolly-loops': process.env.WOOLLY_LOOPS_SECRET || 'woolly-loops-dev',
  'default': process.env.DEFAULT_APP_SECRET || 'dev-secret',
  // Add more apps here:
  // 'my-other-app': process.env.MY_OTHER_APP_SECRET,
};

export default async function handler(req) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-id, x-app-secret',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Authenticate
  const appId = req.headers.get('x-app-id') || 'default';
  const appSecret = req.headers.get('x-app-secret');
  const expectedSecret = APP_SECRETS[appId];

  if (!expectedSecret || appSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    
    // Pass through to Anthropic with your key
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

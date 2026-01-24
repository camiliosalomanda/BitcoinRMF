// api/woolly-loops/generate.js
// Woolly Loops specific endpoint with kid-friendly system prompt built-in

export const config = {
  runtime: 'edge',
};

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const APP_SECRET = process.env.WOOLLY_LOOPS_SECRET || 'woolly-loops-dev';

const WOOLLY_SYSTEM_PROMPT = `You are Woolly, a friendly sheep who helps children learn to crochet! 

Your responses should be:
- Written for kids aged 4-10
- Use simple, encouraging language
- Break patterns into small, numbered steps (max 15 steps)
- Use kid-friendly terms:
  • "Loop Train" instead of "chain stitch"
  • "Tall Stick" instead of "double crochet"  
  • "Short Stick" instead of "single crochet"
  • "Magic Circle" instead of "magic ring"
- Include yarn color and hook size suggestions
- Add encouraging phrases like "Great job!" and "You can do it!"

ALWAYS respond with valid JSON in this exact format:
{
  "patternName": "Friendly name for the project",
  "difficulty": "Easy" or "Medium",
  "estimatedTime": "10-15 minutes",
  "materials": ["list", "of", "materials"],
  "steps": [
    { "number": 1, "instruction": "Step description", "tip": "Optional helpful tip" }
  ],
  "celebration": "Encouraging completion message with emoji"
}`;

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-secret',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify app secret
  if (req.headers.get('x-app-secret') !== APP_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, image } = await req.json();

    if (!prompt && !image) {
      return new Response(JSON.stringify({ error: 'Prompt or image required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build message content
    const content = [];
    
    if (image) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mediaType || 'image/jpeg',
          data: image.data,
        },
      });
    }

    content.push({
      type: 'text',
      text: prompt || 'Create a simple crochet pattern inspired by this image.',
    });

    // Call Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: WOOLLY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate pattern' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === 'text');

    if (!textContent) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON from response
    let pattern;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      pattern = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: textContent.text };
    } catch {
      pattern = { raw: textContent.text };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      pattern,
      usage: data.usage,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Woolly Loops API Service
 * 
 * Drop this file into your React Native app.
 * Update API_URL after deploying your gateway.
 */

// ⚠️ UPDATE THIS after deploying your Vercel project
const API_URL = __DEV__ 
  ? 'http://localhost:3000'  // Local dev with `vercel dev`
  : 'https://YOUR-PROJECT.vercel.app';  // Your deployed URL

// Must match WOOLLY_LOOPS_SECRET in your Vercel env vars
const APP_SECRET = 'woolly-loops-dev';  // Change in production!

interface Pattern {
  patternName: string;
  difficulty: 'Easy' | 'Medium';
  estimatedTime: string;
  materials: string[];
  steps: Array<{
    number: number;
    instruction: string;
    tip?: string;
  }>;
  celebration: string;
}

interface GenerateResponse {
  success: boolean;
  pattern: Pattern;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Generate a crochet pattern from text description
 */
export async function generatePatternFromText(description: string): Promise<Pattern> {
  const response = await fetch(`${API_URL}/api/woolly-loops/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': APP_SECRET,
    },
    body: JSON.stringify({
      prompt: `Create a kid-friendly crochet pattern for: ${description}`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate pattern');
  }

  const data: GenerateResponse = await response.json();
  return data.pattern;
}

/**
 * Generate a crochet pattern from an image
 */
export async function generatePatternFromImage(
  imageBase64: string, 
  mediaType: string = 'image/jpeg'
): Promise<Pattern> {
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const response = await fetch(`${API_URL}/api/woolly-loops/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': APP_SECRET,
    },
    body: JSON.stringify({
      prompt: 'Create a simple crochet pattern inspired by this image. Make it fun and easy for kids!',
      image: {
        data: base64Data,
        mediaType,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate pattern');
  }

  const data: GenerateResponse = await response.json();
  return data.pattern;
}

/**
 * Check if the API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

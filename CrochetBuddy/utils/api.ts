import { StitchNames } from '../constants/Colors';
import { PatternData, StitchTag } from '../constants/Types';

// ============================================
// API CONFIGURATION
// ============================================

const API_URL = __DEV__
  ? 'https://vercel-api-gateway-gules.vercel.app'
  : 'https://vercel-api-gateway-gules.vercel.app';  // ← Replace with your production Vercel URL

const APP_ID = 'woolly-loops';

// Request signing: generates a timestamp-based signature so the server
// can verify requests came from this app without embedding a secret.
// The server uses the shared secret + timestamp + body hash to validate.
const generateRequestSignature = async (body: string): Promise<{ timestamp: string; signature: string }> => {
  const timestamp = Date.now().toString();
  // Simple hash: the server validates timestamp freshness (±5 min window)
  // and that the request originated from a valid app ID.
  // The actual Anthropic API key stays server-side only.
  const message = `${APP_ID}:${timestamp}:${body.length}`;

  // Use a basic hash for request fingerprinting (not cryptographic auth)
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return {
    timestamp,
    signature: Math.abs(hash).toString(36),
  };
};

// ============================================
// RATE LIMITING
// ============================================

const RATE_LIMIT_COOLDOWN_MS = 10_000; // 10 seconds between requests
let lastRequestTime = 0;

const checkRateLimit = (): void => {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsed) / 1000);
    throw new Error(`Please wait ${waitSeconds} seconds before generating another pattern.`);
  }
  lastRequestTime = now;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Sanitize user input before including in prompts
const MAX_INPUT_LENGTH = 200;
const sanitizeInput = (input: string): string => {
  return input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[<>{}]/g, '')       // Strip characters that could confuse JSON/HTML
    .replace(/[\x00-\x1F]/g, '') // Strip control characters
    .trim();
};

// Validate that an API response has the minimum expected shape
const validatePatternResponse = (parsed: any): boolean => {
  if (!parsed || typeof parsed !== 'object') return false;
  if (typeof parsed.title !== 'string') return false;
  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) return false;
  return parsed.steps.every((step: any) =>
    step && typeof step.instruction === 'string'
  );
};

// Map stitch abbreviations to kid-friendly format
const mapStitchToTag = (stitch: string): StitchTag => {
  const lowerStitch = stitch.toLowerCase().replace(/[^a-z]/g, '');
  
  const stitchMap: Record<string, string> = {
    'ch': 'chain',
    'sl': 'slip',
    'slst': 'slip',
    'sc': 'single',
    'hdc': 'half_double',
    'dc': 'double',
    'tr': 'treble',
    'tc': 'treble',
    'mr': 'magic_ring',
    'inc': 'increase',
    'dec': 'decrease',
    'chain': 'chain',
    'slip': 'slip',
    'single': 'single',
    'double': 'double',
    'treble': 'treble',
    'magic': 'magic_ring',
    'increase': 'increase',
    'decrease': 'decrease',
  };

  const stitchKey = stitchMap[lowerStitch] || 'single';
  const stitchInfo = StitchNames[stitchKey] || StitchNames.single;

  return {
    abbreviation: stitch.toUpperCase(),
    fullName: stitchKey.replace('_', ' '),
    kidName: stitchInfo.kidName,
    emoji: stitchInfo.emoji,
  };
};

// Clean and parse JSON from API response
const cleanAndParseJSON = (text: string): any => {
  try {
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    let jsonStr = jsonMatch[0]
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ');
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
};

// Convert parsed response to PatternData
const responseToPattern = (parsed: any, fallbackTitle: string): PatternData => {
  return {
    id: generateId(),
    title: parsed.title || `${fallbackTitle} Pattern`,
    description: parsed.description || 'A fun crochet project!',
    difficulty: parsed.difficulty || 'Easy Peasy',
    estimatedTime: parsed.estimatedTime || '1 hour',
    materials: parsed.materials || [],
    steps: (parsed.steps || []).map((step: any, index: number) => ({
      stepNumber: step.stepNumber || index + 1,
      title: step.title || `Step ${index + 1}`,
      instruction: step.instruction || '',
      stitches: (step.stitches || []).map(mapStitchToTag),
      stitchCount: step.stitchCount || '',
      visualTip: step.visualTip || '',
      isCompleted: false,
    })),
    createdAt: new Date().toISOString(),
    completedSteps: 0,
    totalStars: 0,
    isComplete: false,
  };
};

// The prompt template for pattern generation
const getPatternPrompt = (context: string) => `You are a friendly crochet pattern designer for kids. Create a detailed, beginner-friendly crochet pattern based on: ${context}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Fun pattern name with emoji",
  "description": "Brief, exciting description for kids",
  "difficulty": "Easy Peasy",
  "estimatedTime": "30 minutes - 1 hour",
  "materials": [
    {"item": "Yarn", "details": "Medium weight, any color you like!", "emoji": "🧶"},
    {"item": "Crochet Hook", "details": "Size 5mm (H/8)", "emoji": "🪝"},
    {"item": "Scissors", "details": "Kid-safe scissors", "emoji": "✂️"},
    {"item": "Yarn Needle", "details": "For weaving in ends", "emoji": "🪡"}
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Make a Magic Circle",
      "instruction": "Wrap yarn around your finger twice, then pull through to make a loop. This is your starting ring!",
      "stitches": ["MR"],
      "stitchCount": "1 magic ring",
      "visualTip": "It should look like a tiny donut!"
    }
  ]
}

Rules:
1. Keep instructions SHORT and use simple words kids understand
2. Include 6-12 steps maximum
3. Use encouraging language and fun comparisons
4. Each step should be one clear action
5. Difficulty must be exactly: "Easy Peasy", "A Little Tricky", or "Challenge Mode"
6. Return ONLY valid JSON, no other text`;

// ============================================
// 🔐 SECURE API CALL (goes through your Vercel server)
// ============================================

const API_TIMEOUT_MS = 30000;

const callAnthropicViaProxy = async (body: object): Promise<any> => {
  const bodyStr = JSON.stringify(body);
  const { timestamp, signature } = await generateRequestSignature(bodyStr);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/anthropic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': APP_ID,
        'x-timestamp': timestamp,
        'x-signature': signature,
      },
      body: bodyStr,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// ============================================
// MAIN PATTERN GENERATION FUNCTIONS
// ============================================

// Main pattern generation function (text only)
export const generatePattern = async (designIdea: string): Promise<PatternData> => {
  checkRateLimit();

  const sanitized = sanitizeInput(designIdea);
  if (!sanitized) {
    throw new Error('Please enter a valid design idea');
  }

  const prompt = getPatternPrompt(`this idea: "${sanitized}"`);

  try {
    const data = await callAnthropicViaProxy({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No content in API response');
    }

    const parsed = cleanAndParseJSON(content);

    if (!parsed || !validatePatternResponse(parsed)) {
      throw new Error('Invalid pattern data received');
    }

    return responseToPattern(parsed, sanitized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Pattern generation failed';
    console.error('Pattern generation error:', message);
    throw error;
  }
};

// Maximum base64 image size (~5MB decoded)
const MAX_IMAGE_BASE64_LENGTH = 7_000_000;

// Generate pattern from image (base64 passed directly)
export const generatePatternFromImage = async (
  base64Image: string,
  additionalContext?: string
): Promise<PatternData> => {
  checkRateLimit();

  try {
    // Clean the base64 string (remove data URI prefix if present)
    let cleanBase64 = base64Image;
    if (base64Image.includes('base64,')) {
      cleanBase64 = base64Image.split('base64,')[1];
    }

    if (!cleanBase64 || cleanBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      throw new Error('Image is too large. Please try a smaller image.');
    }

    const sanitizedContext = additionalContext ? sanitizeInput(additionalContext) : '';
    const contextText = sanitizedContext
      ? `this image. Additional details: "${sanitizedContext}"`
      : 'this image. Look at what is shown and create a crochet pattern to make something similar or inspired by it.';

    const prompt = getPatternPrompt(contextText);

    const data = await callAnthropicViaProxy({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: cleanBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No content in API response');
    }

    const parsed = cleanAndParseJSON(content);

    if (!parsed || !validatePatternResponse(parsed)) {
      throw new Error('Invalid pattern data received');
    }

    return responseToPattern(parsed, sanitizedContext || 'Picture Project');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image pattern generation failed';
    console.error('Image pattern generation error:', message);
    throw error;
  }
};

// Fallback pattern for testing/offline
export const getFallbackPattern = (designIdea: string): PatternData => {
  return {
    id: generateId(),
    title: `🧶 ${designIdea}`,
    description: 'A wonderful handmade creation!',
    difficulty: 'Easy Peasy',
    estimatedTime: '30-45 minutes',
    materials: [
      { item: 'Yarn', details: 'Medium weight, your favorite color', emoji: '🧶' },
      { item: 'Crochet Hook', details: 'Size 5mm (H/8)', emoji: '🪝' },
      { item: 'Scissors', details: 'For cutting yarn', emoji: '✂️' },
      { item: 'Yarn Needle', details: 'For finishing', emoji: '🪡' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Make a Slip Knot',
        instruction: 'Make a loop with your yarn and pull the tail through. This is your first loop on the hook!',
        stitches: [mapStitchToTag('sl')],
        stitchCount: '1 slip knot',
        visualTip: 'It looks like a pretzel! 🥨',
        isCompleted: false,
      },
      {
        stepNumber: 2,
        title: 'Chain 10',
        instruction: 'Yarn over and pull through the loop. Do this 10 times to make a little train of loops!',
        stitches: [mapStitchToTag('ch')],
        stitchCount: '10 chains',
        visualTip: 'Count each bump - that is one chain! 🚂',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Single Crochet Row',
        instruction: 'Put your hook in the second chain from your hook. Yarn over, pull through, yarn over again, pull through both loops!',
        stitches: [mapStitchToTag('sc')],
        stitchCount: '9 single crochets',
        visualTip: 'Each stitch is like giving the yarn a little hug! 🤗',
        isCompleted: false,
      },
      {
        stepNumber: 4,
        title: 'Turn and Chain',
        instruction: 'Turn your work around (flip it!). Make 1 chain to get ready for the next row.',
        stitches: [mapStitchToTag('ch')],
        stitchCount: '1 chain',
        visualTip: 'Turning is like flipping a pancake! 🥞',
        isCompleted: false,
      },
      {
        stepNumber: 5,
        title: 'Keep Going!',
        instruction: 'Single crochet in each stitch across the row. Turn and chain 1. Keep going until your project is the size you want!',
        stitches: [mapStitchToTag('sc'), mapStitchToTag('ch')],
        stitchCount: '9 single crochets per row',
        visualTip: 'Watch your piece grow bigger and bigger! 📈',
        isCompleted: false,
      },
      {
        stepNumber: 6,
        title: 'Finish Up',
        instruction: 'Cut the yarn leaving a long tail. Pull the tail through the last loop and pull tight. Use your yarn needle to weave in the ends!',
        stitches: [],
        stitchCount: 'Fasten off',
        visualTip: 'You are done! Do a happy dance! 💃🕺',
        isCompleted: false,
      },
    ],
    createdAt: new Date().toISOString(),
    completedSteps: 0,
    totalStars: 0,
    isComplete: false,
  };
};

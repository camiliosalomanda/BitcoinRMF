import { StitchNames } from '../constants/Colors';
import { PatternData, StitchTag } from '../constants/Types';

// ============================================
// 🔐 SECURE API CONFIGURATION
// ============================================
// Your API key is safely stored on Vercel, NOT in this app!

// ⚠️ UPDATE THIS after deploying your Vercel project
const API_URL = __DEV__
  ? 'https://vercel-api-gateway-gules.vercel.app'  // For local testing with `vercel dev`
  : 'https://vercel-api-gateway-gules.vercel.app';  // ← Replace with your actual Vercel URL

// This must match WOOLLY_LOOPS_SECRET in your Vercel environment variables
const APP_SECRET = '1QUP1m+Eq/6ae1p5xSxnOSJqv9gr1M6WR7P39SYMT+I=';  // ← Change this to match your Vercel env var

const APP_ID = 'woolly-loops';

// ============================================
// HELPER FUNCTIONS (unchanged)
// ============================================

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

const callAnthropicViaProxy = async (body: object): Promise<any> => {
  const response = await fetch(`${API_URL}/api/anthropic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id': APP_ID,
      'x-app-secret': APP_SECRET,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

// ============================================
// MAIN PATTERN GENERATION FUNCTIONS
// ============================================

// Main pattern generation function (text only)
export const generatePattern = async (designIdea: string): Promise<PatternData> => {
  const prompt = getPatternPrompt(`this idea: "${designIdea}"`);

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
    
    if (!parsed) {
      throw new Error('Failed to parse pattern JSON');
    }

    return responseToPattern(parsed, designIdea);
  } catch (error) {
    console.error('Pattern generation error:', error);
    throw error;
  }
};

// Generate pattern from image (base64 passed directly)
export const generatePatternFromImage = async (
  base64Image: string, 
  additionalContext?: string
): Promise<PatternData> => {
  try {
    // Clean the base64 string (remove data URI prefix if present)
    let cleanBase64 = base64Image;
    if (base64Image.includes('base64,')) {
      cleanBase64 = base64Image.split('base64,')[1];
    }

    const contextText = additionalContext 
      ? `this image. Additional details: "${additionalContext}"`
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
    
    if (!parsed) {
      throw new Error('Failed to parse pattern JSON');
    }

    return responseToPattern(parsed, additionalContext || 'Picture Project');
  } catch (error) {
    console.error('Image pattern generation error:', error);
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

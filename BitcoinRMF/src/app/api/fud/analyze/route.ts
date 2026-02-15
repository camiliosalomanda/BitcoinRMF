import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
  sanitizeInput,
} from '@/lib/security';

const SYSTEM_PROMPT = `You are an expert Bitcoin analyst specializing in evaluating FUD (Fear, Uncertainty, and Doubt) narratives. You provide evidence-based analysis to separate legitimate concerns from misinformation.

When analyzing a FUD narrative, you MUST return a JSON object with this exact structure:

{
  "narrative": "The FUD claim being analyzed",
  "category": "QUANTUM|REGULATION|CENTRALIZATION|ENERGY|SCALABILITY|COMPETITION|SECURITY",
  "validityScore": 0-100,
  "status": "ACTIVE|DEBUNKED|PARTIALLY_VALID",
  "evidenceFor": ["Evidence point 1 supporting the concern", "Evidence point 2"],
  "evidenceAgainst": ["Evidence point 1 debunking the claim", "Evidence point 2", "Evidence point 3"],
  "debunkSummary": "Concise 2-3 sentence summary of the analysis",
  "relatedThreats": ["Description of any real underlying threats"],
  "priceImpactEstimate": "How this narrative affects Bitcoin price action",
  "technicalAnalysis": "Technical deep-dive into the claim",
  "historicalContext": "How similar claims have played out historically"
}

Validity score:
- 0-20: Almost entirely FUD, minimal factual basis
- 21-40: Mostly FUD with a grain of truth
- 41-60: Mixed — legitimate concern but exaggerated
- 61-80: Mostly valid concern, some nuance missing
- 81-100: Largely accurate, serious consideration needed

Be balanced and evidence-based. Acknowledge legitimate concerns while identifying exaggeration or misinformation. Return ONLY valid JSON, no markdown.`;

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    const { allowed, remaining, resetIn } = checkRateLimit(`analysis:${clientId}`, 'analysis');
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body = await request.json();
    const { narrative } = body as { narrative: string };

    if (!narrative || typeof narrative !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'FUD narrative is required' }, { status: 400 })
      );
    }

    if (narrative.length > 5000) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Narrative too long (max 5,000 characters)' }, { status: 400 })
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
      );
    }

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Analyze this FUD narrative about Bitcoin:\n\n${sanitizeInput(narrative)}` },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      console.error('Failed to parse AI response for FUD analysis');
      return addSecurityHeaders(
        NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      );
    }

    const jsonResponse = NextResponse.json({
      analysis,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('FUD analysis error:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Anthropic.APIError) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: error.status || 500 })
      );
    }
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

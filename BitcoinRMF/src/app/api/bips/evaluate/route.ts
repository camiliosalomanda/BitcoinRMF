import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
  sanitizeInput,
} from '@/lib/security';

const SYSTEM_PROMPT = `You are an expert Bitcoin protocol analyst specializing in BIP (Bitcoin Improvement Proposal) evaluation against the current threat landscape.

When evaluating a BIP, you MUST return a JSON object with this exact structure:

{
  "bipNumber": "BIP-XXX",
  "title": "BIP title",
  "summary": "2-3 sentence summary of what this BIP does",
  "recommendation": "ESSENTIAL|RECOMMENDED|OPTIONAL|UNNECESSARY|HARMFUL",
  "necessityScore": 0-100,
  "threatsAddressed": ["Description of threat 1 it mitigates", "Description of threat 2"],
  "mitigationEffectiveness": 0-100,
  "communityConsensus": 0-100,
  "implementationReadiness": 0-100,
  "economicImpact": "Description of economic implications",
  "adoptionPercentage": 0-100,
  "securityAnalysis": "How this BIP affects Bitcoin's security posture",
  "tradeoffs": ["Tradeoff 1", "Tradeoff 2"],
  "relatedBIPs": ["BIP-XXX"]
}

Recommendation criteria:
- ESSENTIAL: Addresses critical/high severity threats with no alternative
- RECOMMENDED: Addresses meaningful threats, strong community support
- OPTIONAL: Nice to have, addresses lower-severity threats
- UNNECESSARY: No meaningful security benefit
- HARMFUL: Introduces new attack vectors or weakens security

Be technically precise. Consider real-world adoption challenges, consensus requirements, and economic incentive compatibility. Return ONLY valid JSON, no markdown.`;

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    const { allowed, remaining, resetIn } = checkRateLimit(`analysis:${clientId}`, 'analysis');
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body = await request.json();
    const { bipNumber, description } = body as { bipNumber?: string; description: string };

    if (!description || typeof description !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'BIP description is required' }, { status: 400 })
      );
    }

    if (description.length > 5000) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Description too long (max 5,000 characters)' }, { status: 400 })
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
      );
    }

    const client = new Anthropic();
    const prompt = bipNumber
      ? `Evaluate ${bipNumber}: ${sanitizeInput(description)}`
      : `Evaluate this Bitcoin Improvement Proposal:\n\n${sanitizeInput(description)}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let evaluation;
    try {
      evaluation = JSON.parse(text);
    } catch {
      console.error('Failed to parse AI response for BIP evaluation');
      return addSecurityHeaders(
        NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      );
    }

    const jsonResponse = NextResponse.json({
      evaluation,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('BIP evaluation error:', error instanceof Error ? error.message : 'Unknown error');
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

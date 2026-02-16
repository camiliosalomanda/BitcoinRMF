import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
  sanitizeInput,
} from '@/lib/security';
import { BIP_EVALUATE_SYSTEM_PROMPT } from '@/lib/github-bips';

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
      system: BIP_EVALUATE_SYSTEM_PROMPT,
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

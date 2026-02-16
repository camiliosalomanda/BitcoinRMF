import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
  sanitizeInput,
} from '@/lib/security';

const SYSTEM_PROMPT = `You are an expert Bitcoin security analyst specializing in vulnerability assessment. You analyze weaknesses in Bitcoin's protocol, implementation, and ecosystem using NIST RMF and FAIR frameworks.

When analyzing a vulnerability, you MUST return a JSON object with this exact structure:

{
  "name": "Vulnerability name",
  "description": "Detailed description of the weakness",
  "affectedComponents": ["CONSENSUS|P2P_NETWORK|WALLET|MINING|SCRIPT_ENGINE|CRYPTO_STACK|FULL_NODE|SPV_CLIENT"],
  "severity": 1-5,
  "severityJustification": "Why this severity score",
  "exploitability": 1-5,
  "exploitabilityJustification": "Why this exploitability score",
  "status": "DISCOVERED|CONFIRMED|EXPLOITABLE|PATCHED|MITIGATED",
  "remediationSuggestions": [
    {
      "title": "Remediation title",
      "description": "What to do",
      "effectiveness": 0-100,
      "timelineMonths": number
    }
  ],
  "relatedBIPs": ["BIP-XXX"],
  "evidenceSources": [{"title": "Source title", "type": "RESEARCH|CVE|INCIDENT|NEWS|BIP|WHITEPAPER"}],
  "relatedThreats": ["Description of threats that could exploit this vulnerability"]
}

Severity scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Critical
Exploitability scale: 1=Theoretical, 2=Difficult, 3=Moderate, 4=Easy, 5=Trivial

Be technically precise. Return ONLY valid JSON, no markdown.`;

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    const { allowed, remaining, resetIn } = checkRateLimit(`analysis:${clientId}`, 'analysis');
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body = await request.json();
    const { description } = body as { description: string };

    if (!description || typeof description !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Vulnerability description is required' }, { status: 400 })
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
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Analyze this Bitcoin vulnerability:\n\n${sanitizeInput(description)}` },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      console.error('Failed to parse AI response for vulnerability analysis');
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
    console.error('Vulnerability analysis error:', error instanceof Error ? error.message : 'Unknown error');
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

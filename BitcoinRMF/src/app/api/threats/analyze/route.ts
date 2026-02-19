import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
  sanitizeInput,
  extractJSON,
} from '@/lib/security';

const SYSTEM_PROMPT = `You are an expert Bitcoin security analyst specializing in institutional-grade risk management frameworks. You apply NIST RMF, FAIR (Factor Analysis of Information Risk), and STRIDE threat modeling to Bitcoin's threat landscape.

When analyzing a threat, you MUST return a JSON object with this exact structure:

{
  "name": "Threat name",
  "description": "2-3 sentence threat description",
  "strideCategory": "SPOOFING|TAMPERING|REPUDIATION|INFORMATION_DISCLOSURE|DENIAL_OF_SERVICE|ELEVATION_OF_PRIVILEGE",
  "strideRationale": "Why this STRIDE category applies",
  "threatSource": "SOCIAL_MEDIA|TECHNOLOGY|REGULATORY|NETWORK|PROTOCOL|CRYPTOGRAPHIC|OPERATIONAL|SUPPLY_CHAIN",
  "affectedComponents": ["CONSENSUS|P2P_NETWORK|WALLET|MINING|SCRIPT_ENGINE|CRYPTO_STACK|FULL_NODE|SPV_CLIENT"],
  "vulnerability": "What is exploitable and why",
  "exploitScenario": "Realistic attack narrative",
  "likelihood": 1-5,
  "likelihoodJustification": "Why this likelihood score",
  "impact": 1-5,
  "impactJustification": "Why this impact score",
  "fairEstimates": {
    "threatEventFrequency": number,
    "vulnerability": 0-1,
    "lossEventFrequency": number,
    "primaryLossUSD": number,
    "secondaryLossUSD": number,
    "annualizedLossExpectancy": number
  },
  "nistStage": "PREPARE|CATEGORIZE|SELECT|IMPLEMENT|ASSESS|AUTHORIZE|MONITOR",
  "remediationSuggestions": ["suggestion1", "suggestion2"],
  "suggestedVulnerabilities": [
    {
      "name": "Vulnerability name",
      "description": "What is exploitable and why",
      "severity": 1-5,
      "exploitability": 1-5,
      "affectedComponents": ["CONSENSUS|P2P_NETWORK|WALLET|MINING|SCRIPT_ENGINE|CRYPTO_STACK|FULL_NODE|SPV_CLIENT"]
    }
  ],
  "relatedBIPs": ["BIP-XXX"],
  "evidenceSources": [{"title": "Source title", "type": "RESEARCH|CVE|INCIDENT|NEWS|BIP|WHITEPAPER"}]
}

Severity scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Critical
Exploitability scale: 1=Theoretical, 2=Difficult, 3=Moderate, 4=Easy, 5=Trivial

Likelihood scale: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
Impact scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic

Be technically precise. Use real BIP numbers, real attack vectors, and realistic FAIR estimates based on Bitcoin's current state. Return ONLY valid JSON, no markdown.`;

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    // Rate limit
    const { allowed, remaining, resetIn } = checkRateLimit(`analysis:${clientId}`, 'analysis');
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body = await request.json();
    const { description } = body as { description: string };

    if (!description || typeof description !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Threat description is required' }, { status: 400 })
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
        { role: 'user', content: `Analyze this Bitcoin threat:\n\n${sanitizeInput(description)}` },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let analysis;
    try {
      analysis = JSON.parse(extractJSON(text));
    } catch {
      console.error('Failed to parse AI response for threat analysis');
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
    console.error('Threat analysis error:', error instanceof Error ? error.message : 'Unknown error');
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

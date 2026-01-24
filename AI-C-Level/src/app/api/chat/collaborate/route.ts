/**
 * Collaboration API Route
 * Has executives collaborate to refine their responses into one unified response
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ExecutiveRole, CompanyContext } from '@/types/executives';
import { 
  verifyAuth, 
  checkRateLimit, 
  getClientId, 
  unauthorizedResponse, 
  rateLimitResponse,
  addSecurityHeaders,
} from '@/lib/security';

interface ExecutiveResponse {
  executive: ExecutiveRole;
  name: string;
  response: string;
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    // Authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return addSecurityHeaders(unauthorizedResponse(auth.error));
    }

    // Rate limiting
    const rateLimitKey = `collaborate:${auth.userId}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, 'chat');
    
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body = await request.json();
    const { 
      originalQuestion, 
      responses, 
      collaborationPrompt,
      companyContext 
    } = body as {
      originalQuestion: string;
      responses: ExecutiveResponse[];
      collaborationPrompt?: string;
      companyContext?: CompanyContext;
    };

    if (!originalQuestion || !responses || responses.length === 0) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Original question and responses are required' }, { status: 400 })
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'API key not configured' }, { status: 500 })
      );
    }

    const client = new Anthropic();

    // Build context string
    let contextStr = '';
    if (companyContext) {
      contextStr = `Company Context: ${companyContext.name}, Industry: ${companyContext.industry}, Size: ${companyContext.size}\n\n`;
    }

    // Build the collaboration prompt
    const executiveResponses = responses.map(r => 
      `**${r.executive} (${r.name}):**\n${r.response}`
    ).join('\n\n');

    const systemPrompt = `You are facilitating a C-Suite executive collaboration session. Your role is to synthesize the perspectives of all executives into a unified, actionable recommendation.

${contextStr}The executives have provided their individual perspectives on a business question. Your task is to:

1. Identify common themes and points of agreement
2. Acknowledge different perspectives where they exist
3. Synthesize everything into a clear, unified recommendation
4. Ensure the final recommendation is actionable and balanced

Write as "The Executive Team" - use "we" language to show consensus. Be concise but comprehensive. Format with clear sections if needed.`;

    const userPrompt = `**Original Question:**
${originalQuestion}

**Individual Executive Responses:**

${executiveResponses}

${collaborationPrompt ? `**Additional Direction from User:**\n${collaborationPrompt}\n\n` : ''}**Task:** Please synthesize these perspectives into a unified executive team recommendation. Highlight areas of consensus and provide a clear, actionable path forward.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const unifiedResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Unable to generate unified response.';

    const jsonResponse = NextResponse.json({
      message: 'Collaboration complete',
      unifiedResponse,
      tokens: response.usage.output_tokens,
    });

    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('Collaboration error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

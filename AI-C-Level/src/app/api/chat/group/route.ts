/**
 * Group Chat API Route
 * Gets responses from all executives on a single topic
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

const EXECUTIVES: ExecutiveRole[] = ['CFO', 'CMO', 'COO', 'CHRO', 'CTO', 'CCO'];

const EXECUTIVE_PROMPTS: Record<ExecutiveRole, { name: string; prompt: string }> = {
  CFO: {
    name: 'Alex',
    prompt: `You are Alex, the CFO. Respond with financial perspective: costs, ROI, cash flow, budgets, profitability. Be concise (2-4 sentences). Focus only on financial implications.`,
  },
  CMO: {
    name: 'Jordan',
    prompt: `You are Jordan, the CMO. Respond with marketing perspective: brand, customers, growth, campaigns, market positioning. Be concise (2-4 sentences). Focus only on marketing implications.`,
  },
  COO: {
    name: 'Morgan',
    prompt: `You are Morgan, the COO. Respond with operations perspective: processes, efficiency, logistics, resources, execution. Be concise (2-4 sentences). Focus only on operational implications.`,
  },
  CHRO: {
    name: 'Taylor',
    prompt: `You are Taylor, the CHRO. Respond with people perspective: hiring, culture, team, training, employee impact. Be concise (2-4 sentences). Focus only on HR implications.`,
  },
  CTO: {
    name: 'Riley',
    prompt: `You are Riley, the CTO. Respond with technology perspective: systems, tools, security, scalability, tech solutions. Be concise (2-4 sentences). Focus only on technical implications.`,
  },
  CCO: {
    name: 'Casey',
    prompt: `You are Casey, the CCO. Respond with compliance perspective: regulations, risks, legal, policies, governance. Be concise (2-4 sentences). Focus only on compliance implications.`,
  },
};

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    // Authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return addSecurityHeaders(unauthorizedResponse(auth.error));
    }

    // Rate limiting (stricter for group chat - 6 API calls per request)
    const rateLimitKey = `groupchat:${auth.userId}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, 'chat');
    
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body = await request.json();
    const { message, companyContext } = body as {
      message: string;
      companyContext?: CompanyContext;
    };

    if (!message || typeof message !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Message is required' }, { status: 400 })
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
      contextStr = `\n\nCompany: ${companyContext.name}, Industry: ${companyContext.industry}, Size: ${companyContext.size}`;
    }

    // Get responses from all executives in parallel
    const responses = await Promise.all(
      EXECUTIVES.map(async (exec) => {
        try {
          const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            system: EXECUTIVE_PROMPTS[exec].prompt + contextStr,
            messages: [{ role: 'user', content: message }],
          });

          const text = response.content[0].type === 'text' 
            ? response.content[0].text 
            : 'Unable to respond.';

          return {
            executive: exec,
            name: EXECUTIVE_PROMPTS[exec].name,
            response: text,
            tokens: response.usage.output_tokens,
          };
        } catch (error) {
          console.error(`Error from ${exec}:`, error);
          return {
            executive: exec,
            name: EXECUTIVE_PROMPTS[exec].name,
            response: 'Sorry, I encountered an error processing this request.',
            tokens: 0,
          };
        }
      })
    );

    const jsonResponse = NextResponse.json({
      message: 'Group responses generated',
      responses,
      totalTokens: responses.reduce((sum, r) => sum + r.tokens, 0),
    });

    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('Group chat error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

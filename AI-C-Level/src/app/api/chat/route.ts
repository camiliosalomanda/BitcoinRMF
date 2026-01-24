/**
 * Executive Chat API Route
 * Handles chat interactions with AI executives
 * Supports both streaming and non-streaming responses
 * 
 * Security: Protected route with authentication and rate limiting
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
  logSecurityEvent,
  sanitizeInput,
} from '@/lib/security';

// Executive system prompts
const EXECUTIVE_PROMPTS: Record<ExecutiveRole, string> = {
  CFO: `You are Alex, the AI Chief Financial Officer (CFO) for a small business. Your role is to provide strategic financial guidance, analysis, and recommendations.

Your core responsibilities include:
- Financial strategy and planning
- Cash flow management and forecasting
- Budgeting and cost control
- Financial reporting and KPI tracking
- Investment and capital allocation advice
- Pricing strategy and profitability analysis

Communication Style:
- Be clear, precise, and data-driven
- Explain financial concepts in accessible terms
- Quantify impacts when possible (dollars, percentages)
- Proactively flag risks and opportunities
- Use concrete examples and scenarios

When relevant, mention that you can collaborate with other executives (CMO Jordan, COO Morgan, CHRO Taylor, CTO Riley, CCO Casey) on cross-functional matters.`,

  CMO: `You are Jordan, the AI Chief Marketing Officer (CMO) for a small business. You serve as a strategic marketing leader and growth partner.

Your core responsibilities include:
- Marketing strategy development and execution
- Brand management and positioning
- Customer acquisition and retention
- Content strategy and campaign management
- Market research and competitive analysis
- Marketing budget optimization

Communication Style:
- Be creative yet data-driven—balance inspiration with metrics
- Speak in terms of customer value and business impact
- Make complex marketing concepts accessible
- Always tie recommendations back to ROI and growth
- Be enthusiastic but realistic about expectations

When discussing budgets over $5,000, recommend CFO Alex review. Collaborate with other executives on cross-functional initiatives.`,

  COO: `You are Morgan, the AI Chief Operating Officer (COO) for a small business. You serve as the operational backbone ensuring everything runs smoothly and efficiently.

Your core responsibilities include:
- Operations management and process optimization
- Vendor and supply chain management
- Resource planning and capacity management
- Quality control and continuous improvement
- Cost efficiency and waste reduction
- Operational metrics and KPIs

Communication Style:
- Be practical, systematic, and solutions-oriented
- Use data and metrics to support recommendations
- Think in terms of processes, workflows, and systems
- Balance efficiency with quality and employee wellbeing
- Be direct about constraints and realistic timelines

Coordinate with other executives: CFO on budgets, CMO on fulfillment capacity, CHRO on staffing, CTO on automation.`,

  CHRO: `You are Taylor, the AI Chief Human Resources Officer (CHRO) for a small business. You serve as the people strategist and culture champion.

Your core responsibilities include:
- Talent acquisition and recruitment
- Employee development and training
- Culture building and engagement
- Performance management systems
- Compensation and benefits strategy
- HR compliance and policy development

Communication Style:
- Be empathetic, approachable, and people-focused
- Balance employee advocacy with business needs
- Use data but remember the human element
- Be direct but tactful with sensitive issues
- Maintain confidentiality and build trust

Note: I provide HR guidance, not legal advice. For specific employment law questions, consult an employment attorney.`,

  CTO: `You are Riley, the AI Chief Technology Officer (CTO) for a small business. You serve as the technology strategist and guardian of technical infrastructure.

Your core responsibilities include:
- Technology strategy and roadmap
- Architecture and infrastructure design
- Security and compliance oversight
- Vendor and tool evaluation
- Technical team leadership
- Innovation and emerging technology assessment

Communication Style:
- Translate technical concepts into business language
- Be pragmatic—focus on solutions that fit size and budget
- Emphasize security without creating fear
- Balance innovation with stability
- Be honest about trade-offs and limitations

When discussing BizAI security: All data is encrypted (AES-256 at rest, TLS 1.3 in transit), with row-level security isolation. AI conversations are not retained by Anthropic.`,

  CCO: `You are Casey, the AI Chief Compliance Officer (CCO) for a small business. You serve as the guardian of regulatory compliance and risk management.

Your core responsibilities include:
- Regulatory compliance monitoring
- Risk assessment and mitigation
- Policy and procedure development
- Audit preparation and support
- Compliance training guidance
- Data privacy and protection

Compliance Expertise Areas:
- Data Privacy: GDPR, CCPA, state privacy laws
- Financial: SOX, GAAP, tax compliance
- Employment: EEOC, ADA, FMLA, FLSA, OSHA
- Industry-Specific: HIPAA, PCI-DSS, FINRA

Communication Style:
- Be precise and thorough
- Explain regulations in plain language
- Provide actionable recommendations
- Flag deadlines and urgent matters clearly

Important: I provide compliance guidance, not legal advice. For specific legal questions, consult qualified legal counsel.`,
};

// Build system prompt with company context
function buildSystemPrompt(
  role: ExecutiveRole,
  companyContext?: CompanyContext
): string {
  let prompt = EXECUTIVE_PROMPTS[role];

  if (companyContext) {
    prompt += `\n\n## Company Context
- Company Name: ${companyContext.name}
- Industry: ${companyContext.industry}
- Company Size: ${companyContext.size}
- Annual Revenue: ${companyContext.annualRevenue ? `$${companyContext.annualRevenue.toLocaleString()}` : 'Not specified'}
- Currency: ${companyContext.currency}

### Company Goals
${companyContext.goals.map((g) => `- ${g}`).join('\n')}

### Current Challenges
${companyContext.challenges.map((c) => `- ${c}`).join('\n')}

Use this context to provide more relevant, personalized advice.`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    // === AUTHENTICATION ===
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      logSecurityEvent({
        type: 'unauthorized',
        ip: clientId,
        userAgent,
        details: 'Unauthorized chat API access attempt',
      });
      return addSecurityHeaders(unauthorizedResponse(auth.error));
    }

    // === RATE LIMITING ===
    const rateLimitKey = `chat:${auth.userId}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, 'chat');
    
    if (!allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        userId: auth.userId,
        ip: clientId,
        userAgent,
        details: 'Chat rate limit exceeded',
      });
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    // === REQUEST PARSING ===
    const body = await request.json();
    const {
      message,
      executive,
      conversationHistory = [],
      companyContext,
      stream = false,
    } = body as {
      message: string;
      executive: ExecutiveRole;
      conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
      companyContext?: CompanyContext;
      stream?: boolean;
    };

    // === INPUT VALIDATION ===
    if (!message || typeof message !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Message is required' }, { status: 400 })
      );
    }

    if (message.length > 10000) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Message too long (max 10,000 characters)' }, { status: 400 })
      );
    }

    // Validate executive role
    if (!EXECUTIVE_PROMPTS[executive]) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: `Invalid executive role: ${executive}` },
          { status: 400 }
        )
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'ANTHROPIC_API_KEY not configured. Please add it to your environment variables.' },
          { status: 500 }
        )
      );
    }

    const client = new Anthropic();

    // Build messages array (sanitize conversation history)
    const sanitizedHistory = conversationHistory.slice(-20).map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, 10000), // Limit history message length
    }));

    const messages = [
      ...sanitizedHistory,
      { role: 'user' as const, content: message },
    ];

    // Streaming response
    if (stream) {
      const streamResponse = await client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: buildSystemPrompt(executive, companyContext),
        messages,
      });

      // Create a readable stream
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of streamResponse) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
                controller.enqueue(encoder.encode(chunk));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: buildSystemPrompt(executive, companyContext),
      messages,
    });

    // Extract response text
    const assistantMessage =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'I apologize, but I was unable to generate a response.';

    const jsonResponse = NextResponse.json({
      message: assistantMessage,
      executive,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });

    // Add rate limit headers
    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Anthropic.APIError) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: `API Error: ${error.message}` },
          { status: error.status || 500 }
        )
      );
    }

    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

/**
 * Meeting Minutes Generation API
 * Generates formatted meeting minutes from boardroom or individual chat sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  verifyAuth, 
  checkRateLimit, 
  getClientId, 
  unauthorizedResponse, 
  rateLimitResponse,
  addSecurityHeaders,
} from '@/lib/security';

interface MeetingData {
  type: 'boardroom' | 'individual';
  executive?: string;
  messages: Array<{
    type: string;
    content?: string;
    responses?: Array<{
      executive: string;
      name: string;
      response: string;
    }>;
    timestamp: string;
  }>;
  companyName?: string;
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return addSecurityHeaders(unauthorizedResponse(auth.error));
    }

    const rateLimitKey = `minutes:${auth.userId}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, 'default');
    
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body: MeetingData = await request.json();
    const { type, executive, messages, companyName } = body;

    if (!messages || messages.length === 0) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'No messages to generate minutes from' }, { status: 400 })
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'API key not configured' }, { status: 500 })
      );
    }

    const client = new Anthropic();

    // Format the conversation for the AI
    let conversationText = '';
    
    if (type === 'boardroom') {
      messages.forEach((msg, index) => {
        if (msg.type === 'user') {
          conversationText += `\n## Discussion Topic ${Math.floor(index/2) + 1}\n**User Question:** ${msg.content}\n\n`;
        } else if (msg.type === 'responses' && msg.responses) {
          conversationText += '**Executive Responses:**\n';
          msg.responses.forEach(r => {
            conversationText += `- **${r.executive} (${r.name}):** ${r.response}\n`;
          });
          conversationText += '\n';
        } else if (msg.type === 'unified') {
          conversationText += `**Unified Recommendation:**\n${msg.content}\n\n`;
        }
      });
    } else {
      messages.forEach(msg => {
        const role = msg.type === 'user' ? 'User' : executive || 'Executive';
        conversationText += `**${role}:** ${msg.content}\n\n`;
      });
    }

    const systemPrompt = `You are a professional executive assistant tasked with creating meeting minutes. 
Generate well-formatted meeting minutes in Markdown format with the following sections:

1. **Meeting Header** - Title, Date, Attendees
2. **Executive Summary** - 2-3 sentence overview
3. **Discussion Points** - Key topics discussed with brief summaries
4. **Key Insights** - Important findings or recommendations
5. **Action Items** - Specific next steps with owners if identifiable
6. **Decisions Made** - Any decisions reached

Keep it professional, concise, and actionable. Use bullet points for readability.`;

    const userPrompt = `Please generate meeting minutes from this ${type === 'boardroom' ? 'Executive Boardroom Session' : `session with ${executive}`}.

Company: ${companyName || 'Not specified'}
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
${type === 'boardroom' ? 'Attendees: CFO (Alex), CMO (Jordan), COO (Morgan), CHRO (Taylor), CTO (Riley), CCO (Casey)' : `Attendee: ${executive}`}

**Session Transcript:**
${conversationText}

Generate professional meeting minutes from this session.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const minutes = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Unable to generate meeting minutes.';

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = type === 'boardroom' 
      ? `boardroom-minutes-${dateStr}.md`
      : `${executive?.toLowerCase()}-meeting-${dateStr}.md`;

    const jsonResponse = NextResponse.json({
      minutes,
      filename,
      generatedAt: new Date().toISOString(),
    });

    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('Meeting minutes error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

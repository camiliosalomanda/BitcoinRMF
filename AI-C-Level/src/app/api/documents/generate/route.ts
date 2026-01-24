/**
 * Executive File Generation API
 * Generates documents, reports, and files based on executive conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ExecutiveRole } from '@/types/executives';
import { 
  verifyAuth, 
  checkRateLimit, 
  getClientId, 
  unauthorizedResponse, 
  rateLimitResponse,
  addSecurityHeaders,
} from '@/lib/security';

type FileType = 'markdown' | 'csv' | 'json' | 'txt';

interface GenerateRequest {
  executive: ExecutiveRole;
  prompt: string;
  fileType: FileType;
  context?: string;
  companyName?: string;
}

const FILE_TYPE_INSTRUCTIONS: Record<FileType, string> = {
  markdown: 'Generate well-formatted Markdown with headers, lists, and tables where appropriate.',
  csv: 'Generate valid CSV data with a header row. Use commas as delimiters. Ensure all values are properly escaped.',
  json: 'Generate valid JSON. Use proper formatting with indentation.',
  txt: 'Generate plain text content.',
};

const EXECUTIVE_FILE_SPECIALTIES: Record<ExecutiveRole, string[]> = {
  CFO: ['Financial reports', 'Budget templates', 'Cash flow projections', 'ROI analyses', 'Pricing models'],
  CMO: ['Marketing plans', 'Campaign briefs', 'Content calendars', 'Competitor analyses', 'Brand guidelines'],
  COO: ['Process documentation', 'SOP templates', 'Project plans', 'Efficiency reports', 'Vendor comparisons'],
  CHRO: ['Job descriptions', 'Org charts', 'Policy documents', 'Training plans', 'Performance templates'],
  CTO: ['Technical specs', 'Architecture docs', 'Security checklists', 'Tech stack comparisons', 'API documentation'],
  CCO: ['Compliance checklists', 'Policy templates', 'Audit reports', 'Risk assessments', 'Regulatory guides'],
};

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return addSecurityHeaders(unauthorizedResponse(auth.error));
    }

    const rateLimitKey = `filegen:${auth.userId}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, 'chat');
    
    if (!allowed) {
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    const body: GenerateRequest = await request.json();
    const { executive, prompt, fileType, context, companyName } = body;

    if (!executive || !prompt || !fileType) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Executive, prompt, and fileType are required' }, { status: 400 })
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'API key not configured' }, { status: 500 })
      );
    }

    const client = new Anthropic();

    const specialties = EXECUTIVE_FILE_SPECIALTIES[executive].join(', ');
    
    const systemPrompt = `You are ${executive}, an AI executive assistant specializing in: ${specialties}.

Your task is to generate a file/document based on the user's request.

${FILE_TYPE_INSTRUCTIONS[fileType]}

IMPORTANT: Output ONLY the file content. No explanations, no markdown code blocks, no preamble. Just the raw content that should go in the file.

${companyName ? `Company context: ${companyName}` : ''}`;

    const userPrompt = context 
      ? `Based on our previous discussion:\n${context}\n\nNow generate: ${prompt}`
      : prompt;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Clean up content - remove markdown code blocks if present
    content = content.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const sluggedPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30)
      .replace(/-+$/, '');
    
    const extensions: Record<FileType, string> = {
      markdown: 'md',
      csv: 'csv',
      json: 'json',
      txt: 'txt',
    };

    const filename = `${executive.toLowerCase()}-${sluggedPrompt}-${dateStr}.${extensions[fileType]}`;

    const jsonResponse = NextResponse.json({
      content,
      filename,
      fileType,
      executive,
      generatedAt: new Date().toISOString(),
      tokens: response.usage.output_tokens,
    });

    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    console.error('File generation error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

// GET endpoint to list file type options
export async function GET() {
  return addSecurityHeaders(
    NextResponse.json({
      fileTypes: ['markdown', 'csv', 'json', 'txt'],
      executiveSpecialties: EXECUTIVE_FILE_SPECIALTIES,
    })
  );
}

/**
 * CCO Contract Review API
 * Reviews contracts for risks, terms, and compliance issues
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/security';

const anthropic = new Anthropic();

async function parseFiles(formData: FormData): Promise<{ name: string; content: string }[]> {
  const files: { name: string; content: string }[] = [];
  for (const entry of formData.getAll('files')) {
    if (entry instanceof File) {
      try {
        files.push({ name: entry.name, content: await entry.text() });
      } catch { /* skip binary */ }
    }
  }
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(`contract-review:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const contractText = formData.get('contractText') as string || '';
    const context = formData.get('context') as string || '';

    if (files.length === 0 && !contractText.trim()) {
      return NextResponse.json({ error: 'No contract provided' }, { status: 400 });
    }

    let content = '';
    if (contractText.trim()) {
      content = `Contract Text:\n${contractText}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 30000)}\n---`).join('\n\n');
    }
    if (context.trim()) {
      content += `\n\nContext: ${context}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Casey, CCO of BizAI. Review this contract for risks, unfavorable terms, and compliance issues.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "contractType": "<type of contract>",
    "parties": "<parties involved>",
    "overallRisk": "low" | "medium" | "high" | "critical",
    "favorability": <0-100>,
    "criticalIssues": <number>,
    "missingClauses": <number>,
    "recommendation": "sign" | "negotiate" | "reject" | "legal-review"
  },
  "keyTerms": [
    { "term": "<term name>", "value": "<value/duration>", "assessment": "<brief assessment>" }
  ],
  "clauses": [
    {
      "name": "<clause name>",
      "section": "<section reference>",
      "status": "favorable" | "standard" | "unfavorable" | "missing" | "risky",
      "summary": "<what it says>",
      "concern": "<why it's concerning, if any>",
      "suggestion": "<suggested change>"
    }
  ],
  "risks": [
    {
      "id": "<unique id>",
      "category": "liability" | "termination" | "ip" | "payment" | "compliance" | "confidentiality" | "indemnity",
      "severity": "critical" | "high" | "medium" | "low",
      "clause": "<which clause>",
      "issue": "<what's the problem>",
      "potentialImpact": "<business impact>",
      "recommendation": "<how to address>",
      "negotiationLeverage": "high" | "medium" | "low"
    }
  ],
  "missingClauses": ["<missing clause 1>", "<missing clause 2>"],
  "negotiationPoints": ["<point 1>", "<point 2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Focus on:
1. Liability and indemnification terms
2. Termination clauses and penalties
3. IP ownership and licensing
4. Payment terms and penalties
5. Confidentiality obligations
6. Compliance requirements
7. Missing standard protections`
      }],
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('');
    let review;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      review = match ? JSON.parse(match[0]) : null;
    } catch { review = null; }

    if (!review) {
      review = {
        summary: { contractType: 'Unknown', parties: 'Unknown', overallRisk: 'medium', favorability: 50, criticalIssues: 0, missingClauses: 0, recommendation: 'legal-review' },
        keyTerms: [],
        clauses: [],
        risks: [{ id: '1', category: 'compliance', severity: 'medium', clause: 'N/A', issue: 'Could not fully parse contract', potentialImpact: 'Unknown', recommendation: 'Provide clearer contract text', negotiationLeverage: 'medium' }],
        missingClauses: [],
        negotiationPoints: ['Request full contract review'],
        recommendations: ['Provide complete contract text', 'Seek professional legal review'],
      };
    }

    return NextResponse.json({ review });

  } catch (error) {
    console.error('Contract review error:', error);
    return NextResponse.json({ error: 'Failed to review contract.' }, { status: 500 });
  }
}

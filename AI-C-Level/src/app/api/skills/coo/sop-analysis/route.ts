/**
 * COO SOP Analysis API
 * Reviews standard operating procedures for completeness and efficiency
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
    const rateLimitResult = checkRateLimit(`sop-analysis:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const sopDescription = formData.get('sopDescription') as string || '';

    if (files.length === 0 && !sopDescription.trim()) {
      return NextResponse.json({ error: 'No SOP information provided' }, { status: 400 });
    }

    let content = '';
    if (sopDescription.trim()) {
      content = `SOP Description:\n${sopDescription}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- SOP: ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Morgan, COO of BizAI. Analyze these standard operating procedures and provide a comprehensive review.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "totalSOPs": <number>,
    "averageScore": <0-100>,
    "needsUpdate": <number>,
    "complianceStatus": "compliant" | "at-risk" | "non-compliant",
    "topPriority": "<most urgent issue>"
  },
  "documents": [
    {
      "name": "<SOP name>",
      "department": "<department/function>",
      "lastUpdated": "<estimated date>",
      "completenessScore": <0-100>,
      "clarityScore": <0-100>,
      "complianceScore": <0-100>,
      "status": "current" | "needs-update" | "outdated" | "missing-sections",
      "issues": ["<issue1>", "<issue2>"]
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "sopName": "<which SOP>",
      "category": "completeness" | "clarity" | "compliance" | "efficiency" | "safety" | "training",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "description": "<what's wrong>",
      "section": "<which section>",
      "recommendation": "<how to fix>"
    }
  ],
  "gaps": [
    {
      "area": "<missing SOP area>",
      "description": "<why it's needed>",
      "risk": "high" | "medium" | "low",
      "suggestedSOP": "<suggested SOP title and scope>"
    }
  ],
  "bestPractices": ["<practice1>", "<practice2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Evaluate:
1. Completeness - Are all necessary steps documented?
2. Clarity - Is it easy to follow and understand?
3. Compliance - Does it meet regulatory/industry standards?
4. Efficiency - Are there unnecessary steps?
5. Safety - Are safety considerations addressed?
6. Training - Can someone new follow this?`,
      }],
    });

    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.type === 'text' ? block.text : '')
      .join('');

    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      analysis = {
        summary: { totalSOPs: 0, averageScore: 50, needsUpdate: 0, complianceStatus: 'at-risk', topPriority: 'Provide more SOP details' },
        documents: [],
        issues: [{ id: '1', sopName: 'General', category: 'completeness', severity: 'medium', title: 'Insufficient data', description: 'Could not fully analyze SOPs.', section: 'N/A', recommendation: 'Upload actual SOP documents for detailed analysis.' }],
        gaps: [],
        bestPractices: ['Document all critical processes', 'Review SOPs annually'],
        recommendations: ['Upload complete SOP documents', 'Include process flowcharts', 'Specify compliance requirements'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('SOP analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze SOPs.' }, { status: 500 });
  }
}

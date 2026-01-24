/**
 * CCO Compliance Audit API
 * Evaluates regulatory compliance across the organization
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/security';

const anthropic = new Anthropic();

async function parseFiles(formData: FormData): Promise<{ name: string; content: string }[]> {
  const files: { name: string; content: string }[] = [];
  for (const entry of formData.getAll('files')) {
    if (entry instanceof File) {
      try { files.push({ name: entry.name, content: await entry.text() }); } catch { /* skip binary */ }
    }
  }
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(`cco-audit:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const complianceInfo = formData.get('complianceInfo') as string || '';

    if (files.length === 0 && !complianceInfo.trim()) {
      return NextResponse.json({ error: 'No compliance information provided' }, { status: 400 });
    }

    let content = '';
    if (complianceInfo.trim()) {
      content = `Compliance Information:\n${complianceInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Casey, CCO of BizAI. Conduct a compliance audit based on this information.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "overallScore": <0-100>,
    "areasAssessed": <number>,
    "totalGaps": <number>,
    "criticalGaps": <number>,
    "complianceStatus": "compliant" | "at-risk" | "non-compliant",
    "topRisk": "<biggest compliance risk>"
  },
  "areas": [
    {
      "name": "<compliance area>",
      "framework": "<GDPR, SOC 2, HIPAA, etc.>",
      "status": "compliant" | "partial" | "non-compliant" | "not-assessed",
      "score": <0-100>,
      "gaps": <number>,
      "criticalGaps": <number>,
      "lastAssessed": "<date or 'Not assessed'>"
    }
  ],
  "gaps": [
    {
      "id": "<unique id>",
      "area": "<compliance area>",
      "framework": "<framework>",
      "requirement": "<specific requirement>",
      "severity": "critical" | "high" | "medium" | "low",
      "currentState": "<what exists now>",
      "requiredState": "<what's needed>",
      "remediation": "<how to fix>",
      "deadline": "<suggested timeline>",
      "effort": "low" | "medium" | "high"
    }
  ],
  "metrics": [
    {
      "name": "<metric name>",
      "value": "<current value>",
      "target": "<target value>",
      "status": "met" | "at-risk" | "missed",
      "trend": "improving" | "stable" | "declining"
    }
  ],
  "strengths": ["<strength1>", "<strength2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Assess compliance with applicable frameworks like GDPR, CCPA, SOC 2, ISO 27001, HIPAA, PCI-DSS based on the industry and information provided.`
      }],
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('');
    let audit;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      audit = match ? JSON.parse(match[0]) : null;
    } catch { audit = null; }

    if (!audit) {
      audit = {
        summary: { overallScore: 50, areasAssessed: 0, totalGaps: 0, criticalGaps: 0, complianceStatus: 'at-risk', topRisk: 'Insufficient information' },
        areas: [],
        gaps: [],
        metrics: [],
        strengths: [],
        recommendations: ['Provide more detailed compliance information', 'List applicable regulations'],
      };
    }

    return NextResponse.json({ audit });
  } catch (error) {
    console.error('CCO audit error:', error);
    return NextResponse.json({ error: 'Failed to run compliance audit.' }, { status: 500 });
  }
}

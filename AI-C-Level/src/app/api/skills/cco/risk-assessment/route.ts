/**
 * CCO Risk Assessment API
 * Identifies and evaluates business risks
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
    const rateLimitResult = checkRateLimit(`risk-assessment:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const riskInfo = formData.get('riskInfo') as string || '';

    if (files.length === 0 && !riskInfo.trim()) {
      return NextResponse.json({ error: 'No risk information provided' }, { status: 400 });
    }

    let content = '';
    if (riskInfo.trim()) {
      content = `Business & Risk Information:\n${riskInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Casey, CCO of BizAI. Conduct a comprehensive risk assessment based on this information.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "totalRisks": <number>,
    "criticalRisks": <number>,
    "highRisks": <number>,
    "overallRiskLevel": "low" | "medium" | "high" | "critical",
    "riskScore": <0-100>,
    "topRiskArea": "<highest risk category>"
  },
  "categories": [
    {
      "category": "operational" | "financial" | "strategic" | "compliance" | "reputational" | "cyber" | "legal",
      "riskCount": <number>,
      "avgScore": <number>,
      "criticalCount": <number>,
      "topRisk": "<top risk in category>"
    }
  ],
  "risks": [
    {
      "id": "<unique id>",
      "name": "<risk name>",
      "category": "operational" | "financial" | "strategic" | "compliance" | "reputational" | "cyber" | "legal",
      "likelihood": "rare" | "unlikely" | "possible" | "likely" | "almost-certain",
      "impact": "negligible" | "minor" | "moderate" | "major" | "severe",
      "riskScore": <1-25>,
      "riskLevel": "low" | "medium" | "high" | "critical",
      "description": "<risk description>",
      "mitigation": "<recommended mitigation>",
      "owner": "<suggested owner>",
      "timeline": "<implementation timeline>"
    }
  ],
  "heatmapData": [
    { "likelihood": "<likelihood>", "impact": "<impact>", "count": <number of risks> }
  ],
  "mitigationPriorities": ["<priority 1>", "<priority 2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Assess risks across categories:
- Operational: Process failures, supply chain, key person dependency
- Financial: Cash flow, credit, market, fraud
- Strategic: Competition, market changes, M&A
- Compliance: Regulatory, legal, contractual
- Reputational: Brand, PR, social media
- Cyber: Data breach, ransomware, system failure
- Legal: Litigation, IP, contracts`
      }],
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('');
    let assessment;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      assessment = match ? JSON.parse(match[0]) : null;
    } catch { assessment = null; }

    if (!assessment) {
      assessment = {
        summary: { totalRisks: 0, criticalRisks: 0, highRisks: 0, overallRiskLevel: 'medium', riskScore: 50, topRiskArea: 'Unknown' },
        categories: [],
        risks: [{ id: '1', name: 'Assessment incomplete', category: 'operational', likelihood: 'possible', impact: 'moderate', riskScore: 9, riskLevel: 'medium', description: 'Could not fully assess risks.', mitigation: 'Provide more business details.', owner: 'Management', timeline: 'Immediate' }],
        heatmapData: [],
        mitigationPriorities: ['Provide detailed business information'],
        recommendations: ['Describe key operations and processes', 'List known risks and concerns', 'Include technology and vendor dependencies'],
      };
    }

    return NextResponse.json({ assessment });

  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json({ error: 'Failed to assess risks.' }, { status: 500 });
  }
}

/**
 * CHRO Compensation Analysis API
 * Benchmarks compensation against market rates
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
    const rateLimitResult = checkRateLimit(`comp-analysis:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const compInfo = formData.get('compInfo') as string || '';

    if (files.length === 0 && !compInfo.trim()) {
      return NextResponse.json({ error: 'No compensation data provided' }, { status: 400 });
    }

    let content = '';
    if (compInfo.trim()) {
      content = `Compensation Information:\n${compInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Taylor, CHRO of BizAI. Analyze this compensation data and provide market benchmarking insights.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "rolesAnalyzed": <number>,
    "avgMarketPosition": <percentile 0-100>,
    "belowMarket": <count of roles below 25th percentile>,
    "atRisk": <count of roles at retention risk>,
    "totalAdjustmentNeeded": "<estimated $ to bring all to target>",
    "topPriority": "<most urgent issue>"
  },
  "roles": [
    {
      "title": "<role title>",
      "level": "<seniority level>",
      "currentSalary": "<current pay>",
      "marketMin": "<25th percentile>",
      "marketMid": "<50th percentile>",
      "marketMax": "<75th percentile>",
      "percentile": <where current falls 0-100>,
      "status": "below" | "competitive" | "above",
      "recommendation": "<specific action>"
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "category": "equity" | "market" | "structure" | "compliance" | "retention",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "affectedRoles": ["<role1>", "<role2>"],
      "description": "<what's wrong>",
      "financialImpact": "<cost or risk>",
      "recommendation": "<how to address>"
    }
  ],
  "metrics": [
    {
      "name": "<metric name>",
      "value": "<current value>",
      "benchmark": "<industry benchmark>",
      "status": "good" | "warning" | "poor",
      "insight": "<what this means>"
    }
  ],
  "equityAnalysis": ["<finding1>", "<finding2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Analyze:
1. Market positioning for each role
2. Internal pay equity
3. Retention risk based on below-market pay
4. Compression issues between levels
5. Geographic and industry factors
6. Total compensation (base + bonus + equity if provided)`,
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
        summary: { rolesAnalyzed: 0, avgMarketPosition: 50, belowMarket: 0, atRisk: 0, totalAdjustmentNeeded: 'TBD', topPriority: 'Provide more data' },
        roles: [],
        issues: [{ id: '1', category: 'market', severity: 'medium', title: 'Insufficient data', affectedRoles: ['All'], description: 'Need more compensation details.', financialImpact: 'Unknown', recommendation: 'Provide role titles, levels, and current salaries.' }],
        metrics: [],
        equityAnalysis: [],
        recommendations: ['Provide detailed salary data', 'Include role levels', 'Specify location and industry'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Compensation analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze compensation.' }, { status: 500 });
  }
}

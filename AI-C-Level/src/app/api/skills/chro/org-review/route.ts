/**
 * CHRO Org Structure Review API
 * Analyzes organizational structure and reporting relationships
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
    const rateLimitResult = checkRateLimit(`org-review:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const orgInfo = formData.get('orgInfo') as string || '';

    if (files.length === 0 && !orgInfo.trim()) {
      return NextResponse.json({ error: 'No org structure information provided' }, { status: 400 });
    }

    let content = '';
    if (orgInfo.trim()) {
      content = `Organization Information:\n${orgInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Taylor, CHRO of BizAI. Analyze this organizational structure and provide insights.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "totalHeadcount": <number>,
    "totalDepartments": <number>,
    "avgSpanOfControl": <number>,
    "orgLayers": <number>,
    "healthScore": <0-100>,
    "topConcern": "<biggest structural issue>"
  },
  "units": [
    {
      "name": "<department/team name>",
      "head": "<leader name/title>",
      "headcount": <number>,
      "directReports": <number>,
      "layers": <number>,
      "spanOfControl": <number>,
      "status": "optimal" | "narrow" | "wide" | "deep",
      "issues": ["<issue1>", "<issue2>"]
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
  "issues": [
    {
      "id": "<unique id>",
      "category": "span" | "layers" | "silos" | "gaps" | "duplication" | "alignment",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "description": "<detailed description>",
      "affectedAreas": ["<area1>", "<area2>"],
      "impact": "<business impact>",
      "recommendation": "<how to address>"
    }
  ],
  "strengths": ["<strength1>", "<strength2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Evaluate:
1. Span of control (ideal: 5-8 direct reports)
2. Organizational layers (fewer is better for agility)
3. Silos and communication barriers
4. Role clarity and duplication
5. Leadership gaps
6. Alignment with business strategy`,
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
        summary: { totalHeadcount: 0, totalDepartments: 0, avgSpanOfControl: 0, orgLayers: 0, healthScore: 50, topConcern: 'Insufficient data' },
        units: [],
        metrics: [],
        issues: [{ id: '1', category: 'gaps', severity: 'medium', title: 'More data needed', description: 'Provide detailed org structure.', affectedAreas: ['All'], impact: 'Cannot assess properly', recommendation: 'Include headcounts and reporting relationships.' }],
        strengths: [],
        recommendations: ['Provide detailed org chart', 'Include headcount per team', 'Describe reporting relationships'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Org review error:', error);
    return NextResponse.json({ error: 'Failed to analyze org structure.' }, { status: 500 });
  }
}

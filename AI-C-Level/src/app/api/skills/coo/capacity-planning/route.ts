/**
 * COO Capacity Planning API
 * Analyzes resource utilization and forecasts capacity needs
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
    const rateLimitResult = checkRateLimit(`capacity-planning:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const capacityInfo = formData.get('capacityInfo') as string || '';

    if (files.length === 0 && !capacityInfo.trim()) {
      return NextResponse.json({ error: 'No capacity information provided' }, { status: 400 });
    }

    let content = '';
    if (capacityInfo.trim()) {
      content = `Capacity Information:\n${capacityInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Morgan, COO of BizAI. Analyze this capacity information and provide comprehensive planning insights.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "overallUtilization": <0-100>,
    "capacityHealth": "healthy" | "strained" | "critical",
    "biggestBottleneck": "<main constraint>",
    "scalingUrgency": "none" | "low" | "medium" | "high" | "critical"
  },
  "resources": [
    {
      "resource": "<resource name>",
      "type": "team" | "equipment" | "facility" | "software" | "budget",
      "currentCapacity": <number or units>,
      "currentUtilization": <0-100>,
      "utilizationStatus": "under" | "optimal" | "high" | "critical",
      "trend": "increasing" | "stable" | "decreasing",
      "forecast3Month": <projected utilization>,
      "forecast6Month": <projected utilization>
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "resource": "<affected resource>",
      "type": "bottleneck" | "overutilization" | "underutilization" | "scaling" | "cost",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "description": "<what's happening>",
      "impact": "<business impact>",
      "recommendation": "<what to do>",
      "estimatedCost": "<cost to fix>"
    }
  ],
  "forecasts": [
    {
      "period": "<e.g., Q2 2025>",
      "demandGrowth": "<expected growth>",
      "capacityNeeded": "<what's needed>",
      "gap": "<shortfall or surplus>",
      "action": "<recommended action>"
    }
  ],
  "scalingOptions": ["<option1>", "<option2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Analyze:
1. Current utilization of all resources
2. Bottlenecks and constraints
3. Growth projections and capacity needs
4. Scaling options (hire, outsource, automate, etc.)
5. Cost-benefit of different approaches`,
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
        summary: { overallUtilization: 70, capacityHealth: 'strained', biggestBottleneck: 'Insufficient data', scalingUrgency: 'medium' },
        resources: [],
        issues: [{ id: '1', resource: 'General', type: 'scaling', severity: 'medium', title: 'More data needed', description: 'Provide detailed resource information.', impact: 'Cannot forecast accurately', recommendation: 'Include team sizes, workloads, and growth projections.', estimatedCost: 'TBD' }],
        forecasts: [],
        scalingOptions: ['Provide more detailed capacity data for specific options'],
        recommendations: ['Include specific resource numbers', 'Describe current bottlenecks', 'Share growth projections'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Capacity planning error:', error);
    return NextResponse.json({ error: 'Failed to analyze capacity.' }, { status: 500 });
  }
}

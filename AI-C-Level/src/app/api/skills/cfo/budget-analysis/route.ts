/**
 * CFO Budget Analysis API
 * Analyzes budget vs actual data and identifies variances
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
      } catch {
        // Skip binary files
      }
    }
  }
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(`budget-analysis:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const budgetData = formData.get('budgetData') as string || '';

    if (files.length === 0 && !budgetData.trim()) {
      return NextResponse.json({ error: 'No budget data provided' }, { status: 400 });
    }

    let content = '';
    if (files.length > 0) {
      content = files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 30000)}\n---`).join('\n\n');
    }
    if (budgetData.trim()) {
      content += `\n\nAdditional budget data:\n${budgetData}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Alex, CFO of BizAI. Analyze this budget data and provide a comprehensive budget variance analysis.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "period": "<period covered>",
    "totalBudget": "<formatted amount>",
    "totalActual": "<formatted amount>",
    "totalVariance": "<formatted amount>",
    "variancePercent": <number>,
    "overallStatus": "excellent" | "good" | "warning" | "critical"
  },
  "lineItems": [
    {
      "category": "<category name>",
      "budgeted": <number>,
      "actual": <number>,
      "variance": <number>,
      "variancePercent": <number>,
      "status": "under" | "on-track" | "over" | "critical",
      "notes": "<brief explanation>"
    }
  ],
  "insights": [
    {
      "id": "<unique id>",
      "type": "overspend" | "underspend" | "opportunity" | "risk" | "trend",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "title": "<insight title>",
      "description": "<detailed description>",
      "amount": "<relevant amount>",
      "recommendation": "<action to take>"
    }
  ],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Focus on:
1. Identifying significant budget variances (over 10%)
2. Categorizing overspends and underspends
3. Finding patterns or trends
4. Highlighting risks and opportunities
5. Providing actionable recommendations`,
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
        summary: {
          period: 'Unknown',
          totalBudget: '$0',
          totalActual: '$0',
          totalVariance: '$0',
          variancePercent: 0,
          overallStatus: 'warning',
        },
        lineItems: [],
        insights: [{
          id: '1',
          type: 'risk',
          severity: 'medium',
          title: 'Unable to parse budget data',
          description: 'The budget data could not be fully parsed. Please check the format.',
          amount: 'N/A',
          recommendation: 'Provide budget data in CSV format with Category, Budgeted, Actual columns.',
        }],
        recommendations: ['Provide clearer budget data format', 'Include category labels', 'Ensure numeric values are properly formatted'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Budget analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze budget.' }, { status: 500 });
  }
}

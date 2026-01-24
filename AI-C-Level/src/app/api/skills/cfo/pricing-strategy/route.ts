/**
 * CFO Pricing Strategy API
 * Analyzes pricing models and recommends optimizations
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
    const rateLimitResult = checkRateLimit(`pricing-strategy:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const pricingInfo = formData.get('pricingInfo') as string || '';

    if (files.length === 0 && !pricingInfo.trim()) {
      return NextResponse.json({ error: 'No pricing information provided' }, { status: 400 });
    }

    let content = '';
    if (pricingInfo.trim()) {
      content = `Pricing Information:\n${pricingInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Alex, CFO of BizAI. Analyze this pricing information and provide strategic recommendations.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "currentModel": "<description of current pricing model>",
    "marketPosition": "premium" | "mid-market" | "budget" | "mixed",
    "overallAssessment": "optimal" | "needs-adjustment" | "significant-changes-needed",
    "potentialRevenueGain": "<estimated revenue increase>"
  },
  "tiers": [
    {
      "name": "<tier name>",
      "currentPrice": "<current price>",
      "suggestedPrice": "<suggested price>",
      "changePercent": <number>,
      "rationale": "<why this change>",
      "expectedImpact": "<expected business impact>"
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "type": "underpriced" | "overpriced" | "opportunity" | "competitive" | "margin",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "description": "<detailed description>",
      "revenue_impact": "<impact on revenue>",
      "recommendation": "<action to take>"
    }
  ],
  "competitors": [
    {
      "competitor": "<competitor name>",
      "theirPrice": "<their price point>",
      "yourPrice": "<your comparable price>",
      "positioning": "premium" | "competitive" | "budget" | "unknown",
      "notes": "<key differences>"
    }
  ],
  "strategies": [
    "<pricing strategy suggestion 1>",
    "<pricing strategy suggestion 2>"
  ],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Focus on:
1. Price optimization opportunities
2. Competitive positioning
3. Value-based pricing potential
4. Margin improvement
5. Market segmentation strategies`,
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
          currentModel: 'Unable to determine',
          marketPosition: 'mixed',
          overallAssessment: 'needs-adjustment',
          potentialRevenueGain: 'Unknown',
        },
        tiers: [],
        issues: [{
          id: '1',
          type: 'opportunity',
          severity: 'medium',
          title: 'More information needed',
          description: 'Could not fully analyze pricing. Please provide more details.',
          revenue_impact: 'Unknown',
          recommendation: 'Provide detailed pricing tiers, costs, and competitor information.',
        }],
        competitors: [],
        strategies: ['Conduct market research', 'Survey customers on price sensitivity', 'Analyze competitor pricing'],
        recommendations: ['Provide more detailed pricing information', 'Include competitor pricing data', 'Share cost structure for margin analysis'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Pricing strategy error:', error);
    return NextResponse.json({ error: 'Failed to analyze pricing.' }, { status: 500 });
  }
}

/**
 * CMO Competitor Analysis API
 * Analyzes competitive landscape and positioning
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
    const rateLimitResult = checkRateLimit(`competitor-analysis:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const competitorInfo = formData.get('competitorInfo') as string || '';

    if (files.length === 0 && !competitorInfo.trim()) {
      return NextResponse.json({ error: 'No competitor information provided' }, { status: 400 });
    }

    let content = '';
    if (competitorInfo.trim()) {
      content = `Competitor Information:\n${competitorInfo}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 20000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Jordan, CMO of BizAI. Analyze this competitive landscape information and provide strategic insights.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "totalCompetitors": <number>,
    "marketPosition": "leader" | "challenger" | "follower" | "niche",
    "competitiveAdvantage": "<your main advantage>",
    "biggestThreat": "<biggest competitive threat>"
  },
  "competitors": [
    {
      "name": "<competitor name>",
      "website": "<website url>",
      "positioning": "<how they position themselves>",
      "targetAudience": "<their target market>",
      "strengths": ["<strength1>", "<strength2>"],
      "weaknesses": ["<weakness1>", "<weakness2>"],
      "pricingModel": "<their pricing approach>",
      "marketShare": "<estimated market share>",
      "threatLevel": "high" | "medium" | "low"
    }
  ],
  "insights": [
    {
      "id": "<unique id>",
      "type": "opportunity" | "threat" | "gap" | "trend" | "differentiator",
      "title": "<insight title>",
      "description": "<detailed description>",
      "competitors": ["<related competitors>"],
      "actionability": "immediate" | "short-term" | "long-term",
      "recommendation": "<what to do>"
    }
  ],
  "marketPositioning": [
    {
      "dimension": "<e.g., Price, Features, Support>",
      "yourPosition": <1-10>,
      "competitorAverage": <1-10>,
      "leader": "<who leads in this>",
      "gap": "<+X ahead or -X behind>"
    }
  ],
  "strategies": ["<strategy1>", "<strategy2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Focus on:
1. Competitor strengths and weaknesses
2. Market positioning gaps
3. Differentiation opportunities
4. Competitive threats to address
5. Strategic recommendations`,
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
          totalCompetitors: 0,
          marketPosition: 'challenger',
          competitiveAdvantage: 'Unable to determine',
          biggestThreat: 'Insufficient data',
        },
        competitors: [],
        insights: [{
          id: '1',
          type: 'gap',
          title: 'More information needed',
          description: 'Please provide more details about your competitors.',
          competitors: [],
          actionability: 'immediate',
          recommendation: 'List competitor names, websites, and key differentiators.',
        }],
        marketPositioning: [],
        strategies: ['Conduct deeper competitor research'],
        recommendations: ['Provide more competitor details', 'Include competitor websites', 'Describe your differentiators'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Competitor analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze competitors.' }, { status: 500 });
  }
}

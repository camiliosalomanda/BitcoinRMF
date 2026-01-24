/**
 * CMO Content Review API
 * Evaluates content quality and SEO optimization
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
    const rateLimitResult = checkRateLimit(`content-review:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const content = formData.get('content') as string || '';
    const contentUrl = formData.get('contentUrl') as string || '';

    if (files.length === 0 && !content.trim() && !contentUrl.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    let allContent = '';
    if (content.trim()) {
      allContent = `Content to review:\n${content}\n\n`;
    }
    if (contentUrl.trim()) {
      allContent += `Content URL: ${contentUrl}\n\n`;
    }
    if (files.length > 0) {
      allContent += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 15000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Jordan, CMO of BizAI. Review this marketing content for quality, effectiveness, and SEO.

${allContent}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "piecesAnalyzed": <number>,
    "overallScore": <0-100>,
    "contentHealth": "excellent" | "good" | "needs-work" | "poor",
    "topStrength": "<biggest strength>",
    "topPriority": "<most urgent fix>"
  },
  "pieces": [
    {
      "title": "<content piece name/heading>",
      "type": "blog" | "landing" | "email" | "social" | "ad" | "video" | "other",
      "score": <0-100>,
      "strengths": ["<strength1>", "<strength2>"],
      "issues": ["<issue1>", "<issue2>"],
      "seoScore": <0-100>,
      "readabilityScore": <0-100>
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "category": "seo" | "messaging" | "cta" | "structure" | "tone" | "engagement",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "description": "<what's wrong>",
      "location": "<where in the content>",
      "fix": "<how to fix>"
    }
  ],
  "seoAnalysis": {
    "overallScore": <0-100>,
    "titleTag": { "score": <0-100>, "suggestion": "<improvement>" },
    "metaDescription": { "score": <0-100>, "suggestion": "<improvement>" },
    "headings": { "score": <0-100>, "suggestion": "<improvement>" },
    "keywords": { "found": ["<kw1>"], "missing": ["<kw1>"], "density": "<X%>" },
    "readability": { "score": <0-100>, "gradeLevel": "<grade>", "suggestion": "<improvement>" }
  },
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Evaluate:
1. Headline effectiveness and clarity
2. Value proposition clarity
3. Call-to-action strength
4. Tone and voice consistency
5. SEO optimization (keywords, structure)
6. Readability and engagement
7. Mobile-friendliness considerations`,
      }],
    });

    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.type === 'text' ? block.text : '')
      .join('');

    let review;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      review = {
        summary: {
          piecesAnalyzed: 1,
          overallScore: 50,
          contentHealth: 'needs-work',
          topStrength: 'Content provided for analysis',
          topPriority: 'Unable to fully parse - provide clearer content',
        },
        pieces: [],
        issues: [{
          id: '1',
          category: 'structure',
          severity: 'medium',
          title: 'Content format unclear',
          description: 'Could not identify distinct content pieces.',
          location: 'Throughout',
          fix: 'Provide content with clear sections and headings.',
        }],
        seoAnalysis: {
          overallScore: 50,
          titleTag: { score: 50, suggestion: 'Add a clear, keyword-rich title' },
          metaDescription: { score: 50, suggestion: 'Include a compelling meta description' },
          headings: { score: 50, suggestion: 'Use H1, H2, H3 hierarchy' },
          keywords: { found: [], missing: ['target keyword'], density: 'N/A' },
          readability: { score: 50, gradeLevel: 'Unknown', suggestion: 'Aim for 8th grade reading level' },
        },
        recommendations: ['Provide clearer content structure', 'Include headlines and CTAs', 'Add target keywords'],
      };
    }

    return NextResponse.json({ review });

  } catch (error) {
    console.error('Content review error:', error);
    return NextResponse.json({ error: 'Failed to review content.' }, { status: 500 });
  }
}

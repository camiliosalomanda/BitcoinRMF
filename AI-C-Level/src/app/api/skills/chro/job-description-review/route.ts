/**
 * CHRO Job Description Review API
 * Reviews and optimizes job descriptions
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
    const rateLimitResult = checkRateLimit(`jd-review:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);
    const jobDescription = formData.get('jobDescription') as string || '';

    if (files.length === 0 && !jobDescription.trim()) {
      return NextResponse.json({ error: 'No job description provided' }, { status: 400 });
    }

    let content = '';
    if (jobDescription.trim()) {
      content = `Job Description:\n${jobDescription}\n\n`;
    }
    if (files.length > 0) {
      content += files.map(f => `--- ${f.name} ---\n${f.content.slice(0, 15000)}\n---`).join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are Taylor, CHRO of BizAI. Review this job description for clarity, compliance, and inclusivity.

${content}

Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "overallScore": <0-100>,
    "roleClarity": <0-100>,
    "inclusivity": <0-100>,
    "compliance": <0-100>,
    "attractiveness": <0-100>,
    "topIssue": "<biggest problem>"
  },
  "scores": [
    {
      "category": "<category name>",
      "score": <points earned>,
      "maxScore": <max points>,
      "feedback": "<specific feedback>"
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "category": "clarity" | "compliance" | "bias" | "requirements" | "compensation" | "culture",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<issue title>",
      "location": "<where in the JD>",
      "description": "<what's wrong>",
      "suggestion": "<how to fix>"
    }
  ],
  "biasFlags": ["<potential bias 1>", "<potential bias 2>"],
  "missingElements": ["<missing element 1>", "<missing element 2>"],
  "strengths": ["<strength1>", "<strength2>"],
  "rewriteSuggestions": [
    {
      "original": "<problematic text>",
      "suggested": "<improved text>",
      "reason": "<why this is better>"
    }
  ],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Check for:
1. Role clarity - Is the job clearly defined?
2. Bias - Gendered language, age bias, unnecessary requirements
3. Compliance - ADA, EEOC, pay transparency (if required)
4. Requirements - Are they realistic? Must-have vs nice-to-have?
5. Attractiveness - Would candidates want to apply?
6. Company culture - Is it conveyed authentically?`,
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
        summary: { overallScore: 50, roleClarity: 50, inclusivity: 50, compliance: 50, attractiveness: 50, topIssue: 'Could not fully analyze' },
        scores: [],
        issues: [{ id: '1', category: 'clarity', severity: 'medium', title: 'Analysis incomplete', location: 'N/A', description: 'Provide a complete job description.', suggestion: 'Include title, responsibilities, and requirements.' }],
        biasFlags: [],
        missingElements: ['Complete job description needed'],
        strengths: [],
        rewriteSuggestions: [],
        recommendations: ['Provide complete job description', 'Include all standard JD sections'],
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('JD review error:', error);
    return NextResponse.json({ error: 'Failed to review job description.' }, { status: 500 });
  }
}

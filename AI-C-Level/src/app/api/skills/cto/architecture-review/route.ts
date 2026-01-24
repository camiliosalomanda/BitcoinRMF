/**
 * CTO Architecture Review API
 * Evaluates system architecture and provides scalability recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/security';

const anthropic = new Anthropic();

// Parse uploaded files
async function parseFiles(formData: FormData): Promise<{ name: string; content: string }[]> {
  const files: { name: string; content: string }[] = [];
  const fileEntries = formData.getAll('files');
  
  for (const entry of fileEntries) {
    if (entry instanceof File) {
      try {
        const content = await entry.text();
        files.push({ name: entry.name, content });
      } catch {
        console.log(`Skipping binary file: ${entry.name}`);
      }
    }
  }
  
  return files;
}

// Build architecture review prompt
function buildReviewPrompt(description: string, files: { name: string; content: string }[]): string {
  let prompt = `You are Riley, the CTO of BizAI. You're conducting a comprehensive architecture review.

Analyze the provided system architecture and provide a detailed evaluation.

Focus on these key areas:
1. **Scalability** - Can it handle growth? Horizontal vs vertical scaling capabilities
2. **Reliability** - Fault tolerance, redundancy, disaster recovery
3. **Security** - Authentication, authorization, data protection, network security
4. **Maintainability** - Code organization, documentation, testing, CI/CD
5. **Performance** - Latency, throughput, resource efficiency
6. **Cost** - Resource utilization, optimization opportunities

Evaluate these architecture patterns:
- Separation of concerns
- Single responsibility
- API design (RESTful, GraphQL, etc.)
- Database design and indexing
- Caching strategy
- Load balancing
- Message queuing / async processing
- Monitoring and observability
- Error handling and logging
- Configuration management

IMPORTANT: Return your analysis as a JSON object with this exact structure:
{
  "summary": {
    "projectType": "<type of application/system>",
    "mainLanguages": ["<languages>"],
    "frameworks": ["<frameworks/tools>"],
    "estimatedComplexity": "simple" | "moderate" | "complex" | "very-complex"
  },
  "scores": {
    "scalability": <0-100>,
    "reliability": <0-100>,
    "security": <0-100>,
    "maintainability": <0-100>,
    "overall": <0-100>
  },
  "patterns": [
    {
      "name": "<pattern name>",
      "detected": true | false,
      "quality": "good" | "needs-improvement" | "poor" | "not-applicable",
      "notes": "<brief notes>"
    }
  ],
  "issues": [
    {
      "id": "<unique id>",
      "category": "scalability" | "reliability" | "security" | "maintainability" | "performance" | "cost",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "title": "<issue title>",
      "description": "<detailed description>",
      "impact": "<business/technical impact>",
      "recommendation": "<how to address>",
      "effort": "low" | "medium" | "high"
    }
  ],
  "strengths": [
    "<strength 1>",
    "<strength 2>"
  ],
  "recommendations": [
    "<priority recommendation 1>",
    "<priority recommendation 2>",
    "<priority recommendation 3>"
  ]
}

`;

  if (description) {
    prompt += `\nArchitecture Description provided by user:\n${description}\n`;
  }

  if (files.length > 0) {
    prompt += `\nArchitecture files provided:\n`;
    for (const file of files) {
      const maxLength = 3000;
      const truncated = file.content.length > maxLength;
      const displayContent = truncated 
        ? file.content.substring(0, maxLength) + '\n... (truncated)'
        : file.content;
      
      prompt += `\n--- FILE: ${file.name} ---\n`;
      prompt += displayContent;
      prompt += `\n--- END FILE ---\n`;
    }
  }

  prompt += '\nProvide your analysis as valid JSON only, no other text.';

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(`architecture-review:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const description = formData.get('description') as string || '';
    const files = await parseFiles(formData);

    if (!description.trim() && files.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an architecture description or upload files' },
        { status: 400 }
      );
    }

    const prompt = buildReviewPrompt(description, files);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract response text
    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => {
        if (block.type === 'text') {
          return block.text;
        }
        return '';
      })
      .join('');

    // Parse JSON response
    let review;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse review response:', parseError);
      
      // Return a fallback review
      review = {
        summary: {
          projectType: 'Unknown',
          mainLanguages: [],
          frameworks: [],
          estimatedComplexity: 'moderate',
        },
        scores: {
          scalability: 50,
          reliability: 50,
          security: 50,
          maintainability: 50,
          overall: 50,
        },
        patterns: [],
        issues: [
          {
            id: '1',
            category: 'maintainability',
            severity: 'info',
            title: 'Review Incomplete',
            description: 'Unable to fully parse the architecture. Please provide more details or try again.',
            impact: 'Limited insights available',
            recommendation: 'Provide more detailed architecture documentation or description.',
            effort: 'low',
          },
        ],
        strengths: [],
        recommendations: [
          'Provide more detailed architecture documentation',
          'Include system diagrams or configuration files',
          'Describe the technology stack and deployment environment',
        ],
      };
    }

    return NextResponse.json({ review });

  } catch (error) {
    console.error('Architecture review error:', error);
    return NextResponse.json(
      { error: 'Failed to review architecture. Please try again.' },
      { status: 500 }
    );
  }
}

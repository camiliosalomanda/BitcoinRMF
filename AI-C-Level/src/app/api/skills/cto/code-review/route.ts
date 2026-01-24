/**
 * CTO Code Review API
 * Analyzes uploaded code files for security, architecture, and best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/security';

const anthropic = new Anthropic();

// File extension to language mapping
const LANGUAGE_MAP: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JavaScript (React)',
  ts: 'TypeScript',
  tsx: 'TypeScript (React)',
  py: 'Python',
  java: 'Java',
  go: 'Go',
  rb: 'Ruby',
  php: 'PHP',
  cs: 'C#',
  cpp: 'C++',
  c: 'C',
  h: 'C/C++ Header',
  rs: 'Rust',
  swift: 'Swift',
  kt: 'Kotlin',
  sql: 'SQL',
  sh: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  md: 'Markdown',
};

// Detect frameworks from file content and names
function detectFrameworks(files: { name: string; content: string }[]): string[] {
  const frameworks: Set<string> = new Set();
  
  for (const file of files) {
    const content = file.content.toLowerCase();
    const name = file.name.toLowerCase();
    
    // Package.json detection
    if (name === 'package.json') {
      if (content.includes('"react"')) frameworks.add('React');
      if (content.includes('"next"')) frameworks.add('Next.js');
      if (content.includes('"vue"')) frameworks.add('Vue.js');
      if (content.includes('"angular"')) frameworks.add('Angular');
      if (content.includes('"express"')) frameworks.add('Express');
      if (content.includes('"nestjs"') || content.includes('"@nestjs')) frameworks.add('NestJS');
      if (content.includes('"prisma"')) frameworks.add('Prisma');
      if (content.includes('"mongoose"')) frameworks.add('MongoDB/Mongoose');
      if (content.includes('"tailwindcss"')) frameworks.add('Tailwind CSS');
    }
    
    // Python requirements
    if (name === 'requirements.txt' || name === 'pyproject.toml') {
      if (content.includes('django')) frameworks.add('Django');
      if (content.includes('flask')) frameworks.add('Flask');
      if (content.includes('fastapi')) frameworks.add('FastAPI');
      if (content.includes('sqlalchemy')) frameworks.add('SQLAlchemy');
    }
    
    // Go modules
    if (name === 'go.mod') {
      if (content.includes('gin-gonic')) frameworks.add('Gin');
      if (content.includes('echo')) frameworks.add('Echo');
    }
  }
  
  return Array.from(frameworks);
}

// Parse file content
async function parseFiles(formData: FormData): Promise<{ name: string; content: string }[]> {
  const files: { name: string; content: string }[] = [];
  const fileEntries = formData.getAll('files');
  
  for (const entry of fileEntries) {
    if (entry instanceof File) {
      try {
        const content = await entry.text();
        files.push({ name: entry.name, content });
      } catch {
        // Skip binary files
        console.log(`Skipping binary file: ${entry.name}`);
      }
    }
  }
  
  return files;
}

// Build analysis prompt
function buildAnalysisPrompt(files: { name: string; content: string }[]): string {
  let prompt = `You are Riley, the CTO of BizAI. You're conducting a thorough code review.

Analyze the following codebase and provide a comprehensive review. Focus on:

1. **Security** - Vulnerabilities, hardcoded secrets, injection risks, authentication issues, data exposure
2. **Architecture** - Code structure, design patterns, coupling, separation of concerns, scalability
3. **Performance** - Inefficiencies, potential memory leaks, N+1 queries, optimization opportunities  
4. **Maintainability** - Code complexity, documentation, naming conventions, technical debt
5. **Best Practices** - Industry standards, framework-specific patterns, testing coverage

For each finding, provide:
- Category (security, architecture, performance, maintainability, best-practices)
- Severity (critical, high, medium, low, info)
- Clear title
- Detailed description
- Specific file and line if applicable
- Actionable suggestion to fix

IMPORTANT: Return your analysis as a JSON object with this exact structure:
{
  "summary": {
    "totalFiles": <number>,
    "totalLines": <number>,
    "languages": [<list of languages detected>],
    "frameworks": [<list of frameworks detected>]
  },
  "scores": {
    "security": <0-100>,
    "architecture": <0-100>,
    "maintainability": <0-100>,
    "overall": <0-100>
  },
  "findings": [
    {
      "id": "<unique id>",
      "category": "<category>",
      "severity": "<severity>",
      "title": "<short title>",
      "description": "<detailed description>",
      "file": "<filename if applicable>",
      "line": <line number if applicable>,
      "suggestion": "<how to fix>"
    }
  ],
  "recommendations": [
    "<top recommendation 1>",
    "<top recommendation 2>",
    "<top recommendation 3>"
  ]
}

Here are the files to analyze:

`;

  let totalLines = 0;
  
  for (const file of files) {
    const lines = file.content.split('\n').length;
    totalLines += lines;
    
    // Limit content size per file
    const maxLines = 500;
    const contentLines = file.content.split('\n');
    const truncated = contentLines.length > maxLines;
    const displayContent = truncated 
      ? contentLines.slice(0, maxLines).join('\n') + '\n... (truncated)'
      : file.content;
    
    prompt += `\n--- FILE: ${file.name} (${lines} lines) ---\n`;
    prompt += displayContent;
    prompt += '\n--- END FILE ---\n';
  }

  prompt += `\nTotal files: ${files.length}, Total lines: ${totalLines}\n`;
  prompt += '\nProvide your analysis as valid JSON only, no other text.';

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - use IP or a generic key
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(`code-review:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const files = await parseFiles(formData);

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No valid code files provided' },
        { status: 400 }
      );
    }

    // Calculate stats
    const languages = new Set<string>();
    let totalLines = 0;
    
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (LANGUAGE_MAP[ext]) {
        languages.add(LANGUAGE_MAP[ext]);
      }
      totalLines += file.content.split('\n').length;
    }

    const frameworks = detectFrameworks(files);
    const prompt = buildAnalysisPrompt(files);

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
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse analysis response:', parseError);
      
      // Return a fallback analysis
      analysis = {
        summary: {
          totalFiles: files.length,
          totalLines,
          languages: Array.from(languages),
          frameworks,
        },
        scores: {
          security: 70,
          architecture: 70,
          maintainability: 70,
          overall: 70,
        },
        findings: [
          {
            id: '1',
            category: 'info',
            severity: 'info',
            title: 'Analysis Complete',
            description: 'Code was analyzed but detailed findings could not be parsed. Please review the code manually or try again.',
            suggestion: 'Try uploading fewer files or contact support if the issue persists.',
          },
        ],
        recommendations: [
          'Review code manually for security issues',
          'Ensure all dependencies are up to date',
          'Add comprehensive test coverage',
        ],
      };
    }

    // Ensure summary has correct values
    analysis.summary = {
      ...analysis.summary,
      totalFiles: files.length,
      totalLines,
      languages: Array.from(languages),
      frameworks: frameworks.length > 0 ? frameworks : analysis.summary?.frameworks || [],
    };

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Code review error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code. Please try again.' },
      { status: 500 }
    );
  }
}

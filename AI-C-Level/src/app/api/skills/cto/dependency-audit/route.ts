/**
 * CTO Dependency Audit API
 * Analyzes package dependencies for vulnerabilities and outdated packages
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/security';

const anthropic = new Anthropic();

// Detect package manager type
function detectPackageManager(filename: string): string {
  if (filename === 'package.json') return 'npm';
  if (filename === 'requirements.txt' || filename === 'Pipfile') return 'pip';
  if (filename === 'Gemfile') return 'bundler';
  if (filename === 'go.mod') return 'go';
  if (filename === 'Cargo.toml') return 'cargo';
  if (filename === 'pom.xml') return 'maven';
  if (filename === 'build.gradle') return 'gradle';
  return 'unknown';
}

// Build audit prompt
function buildAuditPrompt(packageContent: string, lockContent: string | null, packageManager: string): string {
  let prompt = `You are Riley, the CTO of BizAI. You're conducting a thorough dependency audit.

Analyze the following ${packageManager} dependencies and provide a comprehensive security audit.

Focus on:
1. **Known Vulnerabilities** - CVEs, security advisories for each dependency
2. **Outdated Packages** - Dependencies that have newer versions available
3. **Major Updates** - Dependencies with breaking changes available
4. **License Issues** - Any packages with problematic licenses
5. **Maintenance Status** - Abandoned or unmaintained packages

For each dependency, determine:
- Current version vs latest version
- Whether it has known vulnerabilities
- Severity of any issues found

IMPORTANT: Return your analysis as a JSON object with this exact structure:
{
  "summary": {
    "totalDependencies": <number>,
    "productionDeps": <number>,
    "devDeps": <number>,
    "upToDate": <number>,
    "outdated": <number>,
    "vulnerable": <number>
  },
  "securityScore": <0-100>,
  "dependencies": [
    {
      "name": "<package name>",
      "currentVersion": "<current version>",
      "latestVersion": "<latest stable version>",
      "type": "production" | "development",
      "status": "up-to-date" | "outdated" | "major-update" | "vulnerable",
      "vulnerabilities": [
        {
          "id": "<unique id>",
          "severity": "critical" | "high" | "medium" | "low",
          "title": "<vulnerability title>",
          "description": "<brief description>",
          "recommendation": "<how to fix>",
          "cve": "<CVE ID if applicable>"
        }
      ]
    }
  ],
  "recommendations": [
    "<priority action 1>",
    "<priority action 2>",
    "<priority action 3>"
  ]
}

Package file content:
${packageContent}
`;

  if (lockContent) {
    prompt += `\nLock file content (for exact versions):
${lockContent.substring(0, 5000)}${lockContent.length > 5000 ? '\n... (truncated)' : ''}
`;
  }

  prompt += '\nProvide your analysis as valid JSON only, no other text.';

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(`dependency-audit:${clientIP}`, 'chat');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const packageFile = formData.get('packageFile') as File | null;
    const lockFile = formData.get('lockFile') as File | null;

    if (!packageFile) {
      return NextResponse.json(
        { error: 'Package file is required' },
        { status: 400 }
      );
    }

    const packageContent = await packageFile.text();
    const lockContent = lockFile ? await lockFile.text() : null;
    const packageManager = detectPackageManager(packageFile.name);

    const prompt = buildAuditPrompt(packageContent, lockContent, packageManager);

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
    let audit;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        audit = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse audit response:', parseError);
      
      // Return a fallback audit
      audit = {
        summary: {
          totalDependencies: 0,
          productionDeps: 0,
          devDeps: 0,
          upToDate: 0,
          outdated: 0,
          vulnerable: 0,
        },
        securityScore: 50,
        dependencies: [],
        recommendations: [
          'Unable to parse dependencies. Please check the file format.',
          'Ensure you uploaded a valid package manifest file.',
          'Try again or contact support if the issue persists.',
        ],
      };
    }

    return NextResponse.json({ audit });

  } catch (error) {
    console.error('Dependency audit error:', error);
    return NextResponse.json(
      { error: 'Failed to audit dependencies. Please try again.' },
      { status: 500 }
    );
  }
}

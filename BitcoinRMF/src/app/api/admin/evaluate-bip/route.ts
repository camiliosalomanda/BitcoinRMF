import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
} from '@/lib/security';
import { evaluateSingleBIP } from '@/lib/pipeline';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const { allowed, remaining, resetIn } = checkRateLimit(`analysis:${clientId}`, 'analysis');
  if (!allowed) {
    return addSecurityHeaders(rateLimitResponse(resetIn));
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return addSecurityHeaders(
      NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    );
  }

  try {
    const body = await request.json();
    const { bipId } = body as { bipId: string };

    if (!bipId || typeof bipId !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'bipId is required' }, { status: 400 })
      );
    }

    const result = await evaluateSingleBIP(supabase, bipId, 'manual');

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404
        : result.error?.includes('Could not fetch') ? 502
        : 500;
      return addSecurityHeaders(
        NextResponse.json({ error: result.error }, { status })
      );
    }

    const jsonResponse = NextResponse.json({ evaluation: result.evaluation, bipId });
    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: error.status || 500 })
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return addSecurityHeaders(
      NextResponse.json({ error: `Evaluation failed: ${message}` }, { status: 500 })
    );
  }
}

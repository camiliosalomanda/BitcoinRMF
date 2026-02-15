import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientId, rateLimitResponse } from '@/lib/security';

// Server-side cache: 1-hour TTL
const oembedCache = new Map<string, { html: string; expiry: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

const X_URL_PATTERN = /^https:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/status\/\d{1,20}$/;

async function fetchJSON<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Rate limit
  const clientId = getClientId(request);
  const { allowed, resetIn } = checkRateLimit(`oembed:${clientId}`, 'default');
  if (!allowed) return rateLimitResponse(resetIn);

  const url = request.nextUrl.searchParams.get('url');
  if (!url || !X_URL_PATTERN.test(url)) {
    return NextResponse.json(
      { error: 'Invalid or missing X post URL' },
      { status: 400 }
    );
  }

  // Check cache
  const now = Date.now();
  const cached = oembedCache.get(url);
  if (cached && now < cached.expiry) {
    return NextResponse.json({ html: cached.html });
  }

  // Fetch from Twitter oEmbed (free, no API key required)
  const params = new URLSearchParams({
    url,
    omit_script: 'true',
    theme: 'dark',
    dnt: 'true',
  });

  const data = await fetchJSON<{ html: string }>(
    `https://publish.twitter.com/oembed?${params.toString()}`
  );

  if (!data?.html) {
    return NextResponse.json(
      { error: 'Failed to fetch embed' },
      { status: 502 }
    );
  }

  // Cache result
  oembedCache.set(url, { html: data.html, expiry: now + CACHE_TTL_MS });

  // Evict expired entries periodically
  if (oembedCache.size > 100) {
    for (const [key, val] of oembedCache) {
      if (now > val.expiry) oembedCache.delete(key);
    }
  }

  return NextResponse.json(
    { html: data.html },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60' } }
  );
}

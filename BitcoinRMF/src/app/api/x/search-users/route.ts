import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin';
import { checkRateLimit, rateLimitResponse } from '@/lib/security';

interface CachedResult {
  data: XUser[];
  expiresAt: number;
}

interface XUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

const cache = new Map<string, CachedResult>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 200;

// Cached bearer token (long-lived, re-fetched only on failure)
let cachedBearerToken: string | null = null;

async function getBearerToken(): Promise<string | null> {
  if (cachedBearerToken) return cachedBearerToken;

  const consumerKey = process.env.AUTH_TWITTER_ID;
  const consumerSecret = process.env.AUTH_TWITTER_SECRET;
  if (!consumerKey || !consumerSecret) return null;

  try {
    const credentials = Buffer.from(`${encodeURIComponent(consumerKey)}:${encodeURIComponent(consumerSecret)}`).toString('base64');

    const res = await fetch('https://api.x.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (json.token_type === 'bearer' && json.access_token) {
      cachedBearerToken = json.access_token;
      return cachedBearerToken;
    }
    return null;
  } catch {
    return null;
  }
}

function getCached(query: string): XUser[] | null {
  const entry = cache.get(query.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(query.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCache(query: string, data: XUser[]) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(query.toLowerCase(), { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`x-search:${user.xId}`, 'vote');
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() || '';
  if (q.length < 2 || q.length > 50) {
    return NextResponse.json({ users: [] });
  }

  if (!/^[\w]+$/.test(q)) {
    return NextResponse.json({ users: [] });
  }

  // Check cache first
  const cached = getCached(q);
  if (cached) {
    return NextResponse.json({
      users: cached.map((u) => ({
        xId: u.id,
        xUsername: u.username,
        xName: u.name,
        xProfileImage: u.profile_image_url || '',
      })),
    });
  }

  const bearerToken = await getBearerToken();
  if (!bearerToken) {
    return NextResponse.json({ users: [] });
  }

  try {
    const url = new URL('https://api.x.com/2/users/search');
    url.searchParams.set('query', q);
    url.searchParams.set('user.fields', 'profile_image_url');
    url.searchParams.set('max_results', '5');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(5000),
    });

    // If 401/403, token may be revoked — clear cache and retry once
    if (res.status === 401 || res.status === 403) {
      cachedBearerToken = null;
      const freshToken = await getBearerToken();
      if (!freshToken) return NextResponse.json({ users: [] });

      const retryRes = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${freshToken}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!retryRes.ok) return NextResponse.json({ users: [] });

      const retryJson = await retryRes.json();
      const retryUsers: XUser[] = retryJson.data || [];
      setCache(q, retryUsers);
      return NextResponse.json({
        users: retryUsers.map((u) => ({
          xId: u.id,
          xUsername: u.username,
          xName: u.name,
          xProfileImage: u.profile_image_url || '',
        })),
      });
    }

    if (!res.ok) {
      return NextResponse.json({ users: [] });
    }

    const json = await res.json();
    const xUsers: XUser[] = json.data || [];

    setCache(q, xUsers);

    return NextResponse.json({
      users: xUsers.map((u) => ({
        xId: u.id,
        xUsername: u.username,
        xName: u.name,
        xProfileImage: u.profile_image_url || '',
      })),
    });
  } catch {
    return NextResponse.json({ users: [] });
  }
}

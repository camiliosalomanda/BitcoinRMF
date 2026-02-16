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
  // Evict oldest entries if cache is full
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

  // Check if query contains only valid username characters
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

  const bearerToken = process.env.X_BEARER_TOKEN;
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

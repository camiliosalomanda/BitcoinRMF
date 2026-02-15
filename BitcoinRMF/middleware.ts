import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

// --- Tier configuration ---

interface TierConfig {
  windowMs: number;
  maxRequests: number;
}

const TIERS: Record<string, TierConfig> = {
  analysis: { windowMs: 60_000, maxRequests: 10 },
  vote:     { windowMs: 60_000, maxRequests: 30 },
  default:  { windowMs: 60_000, maxRequests: 60 },
};

const ANALYSIS_PATHS = new Set([
  '/api/threats/analyze',
  '/api/bips/evaluate',
  '/api/fud/analyze',
]);

function getTier(pathname: string, method: string): string | null {
  // Skip auth routes — NextAuth manages its own rate limiting
  if (pathname.startsWith('/api/auth')) return null;

  if (ANALYSIS_PATHS.has(pathname)) return 'analysis';
  if (pathname === '/api/votes' && method === 'POST') return 'vote';
  return 'default';
}

// --- In-memory rate limiter (Edge Runtime compatible — no setInterval) ---

const store = new Map<string, { count: number; resetTime: number }>();

function checkRate(key: string, tier: TierConfig): { allowed: boolean; resetIn: number } {
  const now = Date.now();

  // Lazy cleanup: evict expired entries when the map grows large
  if (store.size > 10_000) {
    for (const [k, v] of store) {
      if (now > v.resetTime) store.delete(k);
    }
  }

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + tier.windowMs });
    return { allowed: true, resetIn: tier.windowMs };
  }

  if (record.count >= tier.maxRequests) {
    return { allowed: false, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, resetIn: record.resetTime - now };
}

// --- Middleware entry point ---

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const tierName = getTier(pathname, method);
  if (tierName === null) return NextResponse.next();

  const tier = TIERS[tierName];

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const key = `${ip}:${tierName}`;
  const { allowed, resetIn } = checkRate(key, tier);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) },
      },
    );
  }

  return NextResponse.next();
}

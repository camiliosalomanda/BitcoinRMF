import { NextResponse } from 'next/server';

export interface BitcoinMetrics {
  price: number | null;
  priceChange24h: number | null;
  hashrate: number | null;     // EH/s
  difficulty: number | null;
  blockHeight: number | null;
  mempoolSize: number | null;  // unconfirmed tx count
  mempoolVSize: number | null; // vMB
  medianFee: number | null;    // sat/vB
  isStale: boolean;
  lastUpdated: string;
}

// Server-side cache: 2-minute TTL
let cachedMetrics: BitcoinMetrics | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

async function fetchJSON<T>(url: string, timeoutMs = 10000): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      return await res.json() as T;
    } catch {
      if (attempt === 1) return null;
      // Brief pause before retry
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

async function fetchMetrics(): Promise<BitcoinMetrics> {
  const [mempoolStats, mempoolBlocks, mempoolHashrate, coingecko, fees] = await Promise.all([
    // mempool.space: mempool stats
    fetchJSON<{ count: number; vsize: number; total_fee: number }>(
      'https://mempool.space/api/mempool'
    ),
    // mempool.space: recent blocks (height + difficulty)
    fetchJSON<Array<{ height: number; difficulty: number }>>(
      'https://mempool.space/api/v1/blocks'
    ),
    // mempool.space: actual mining hashrate
    fetchJSON<{ currentHashrate: number; currentDifficulty: number }>(
      'https://mempool.space/api/v1/mining/hashrate/3d'
    ),
    // CoinGecko: price + 24h change
    fetchJSON<{ bitcoin: { usd: number; usd_24h_change: number } }>(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    ),
    // mempool.space: recommended fees
    fetchJSON<{ halfHourFee: number; hourFee: number; fastestFee: number }>(
      'https://mempool.space/api/v1/fees/recommended'
    ),
  ]);

  const latestBlock = mempoolBlocks?.[0];

  // Hashrate from mempool.space mining endpoint (actual, not estimated)
  // currentHashrate is in H/s, convert to EH/s
  let hashrate: number | null = null;
  if (mempoolHashrate?.currentHashrate) {
    hashrate = Math.round((mempoolHashrate.currentHashrate / 1e18) * 100) / 100;
  }

  return {
    price: coingecko?.bitcoin?.usd ?? null,
    priceChange24h: coingecko?.bitcoin?.usd_24h_change
      ? Math.round(coingecko.bitcoin.usd_24h_change * 100) / 100
      : null,
    hashrate,
    difficulty: mempoolHashrate?.currentDifficulty ?? latestBlock?.difficulty ?? null,
    blockHeight: latestBlock?.height ?? null,
    mempoolSize: mempoolStats?.count ?? null,
    mempoolVSize: mempoolStats?.vsize
      ? Math.round((mempoolStats.vsize / 1_000_000) * 100) / 100
      : null,
    medianFee: fees?.halfHourFee ?? null,
    isStale: false,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const now = Date.now();

    if (cachedMetrics && now < cacheExpiry) {
      return NextResponse.json(cachedMetrics);
    }

    const metrics = await fetchMetrics();
    cachedMetrics = metrics;
    cacheExpiry = now + CACHE_TTL_MS;

    return NextResponse.json(metrics, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=30' },
    });
  } catch {
    // Return stale cache if available, otherwise error
    if (cachedMetrics) {
      return NextResponse.json({ ...cachedMetrics, isStale: true });
    }
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin metrics' },
      { status: 502 }
    );
  }
}

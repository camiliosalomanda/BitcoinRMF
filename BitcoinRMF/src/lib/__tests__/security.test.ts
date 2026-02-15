import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, rateLimitResponse, getClientId, sanitizeInput } from '../security';

// --- checkRateLimit ---

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first request and returns correct remaining count', () => {
    const result = checkRateLimit('test-first', 'default');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59); // 60 max - 1
  });

  it('decrements remaining on subsequent requests', () => {
    const key = 'test-decrement';
    checkRateLimit(key, 'default');
    const second = checkRateLimit(key, 'default');
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(58); // 60 - 2
  });

  it('blocks requests at max limit', () => {
    const key = 'test-block';
    for (let i = 0; i < 60; i++) {
      checkRateLimit(key, 'default');
    }
    const result = checkRateLimit(key, 'default');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets counter after window expires', () => {
    const key = 'test-reset';
    for (let i = 0; i < 60; i++) {
      checkRateLimit(key, 'default');
    }
    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);

    const result = checkRateLimit(key, 'default');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it('tracks different keys independently', () => {
    for (let i = 0; i < 60; i++) {
      checkRateLimit('key-a', 'default');
    }
    const resultA = checkRateLimit('key-a', 'default');
    const resultB = checkRateLimit('key-b', 'default');

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it('vote tier allows 30 requests', () => {
    const key = 'test-vote';
    const first = checkRateLimit(key, 'vote');
    expect(first.remaining).toBe(29);

    for (let i = 1; i < 30; i++) {
      checkRateLimit(key, 'vote');
    }
    const blocked = checkRateLimit(key, 'vote');
    expect(blocked.allowed).toBe(false);
  });

  it('auth tier allows 5 requests', () => {
    const key = 'test-auth';
    const first = checkRateLimit(key, 'auth');
    expect(first.remaining).toBe(4);

    for (let i = 1; i < 5; i++) {
      checkRateLimit(key, 'auth');
    }
    const blocked = checkRateLimit(key, 'auth');
    expect(blocked.allowed).toBe(false);
  });

  it('falls back to default for unknown limitType', () => {
    const result = checkRateLimit('test-unknown', 'default');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });
});

// --- rateLimitResponse ---

describe('rateLimitResponse', () => {
  it('returns 429 status', () => {
    const response = rateLimitResponse(30_000);
    expect(response.status).toBe(429);
  });

  it('body contains error message', async () => {
    const response = rateLimitResponse(30_000);
    const body = await response.json();
    expect(body.error).toBe('Too many requests. Please try again later.');
  });

  it('has Retry-After header with ceiling of resetIn/1000', () => {
    const response = rateLimitResponse(2500);
    expect(response.headers.get('Retry-After')).toBe('3');
  });

  it('Retry-After rounds up correctly for exact seconds', () => {
    const response = rateLimitResponse(5000);
    expect(response.headers.get('Retry-After')).toBe('5');
  });
});

// --- getClientId ---

describe('getClientId', () => {
  function makeRequest(headers: Record<string, string>) {
    return {
      headers: {
        get(name: string) {
          return headers[name] ?? null;
        },
      },
    } as unknown as import('next/server').NextRequest;
  }

  it('extracts the first IP from x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientId(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = makeRequest({ 'x-real-ip': '10.0.0.1' });
    expect(getClientId(req)).toBe('10.0.0.1');
  });

  it('returns "unknown" when no headers present', () => {
    const req = makeRequest({});
    expect(getClientId(req)).toBe('unknown');
  });
});

// --- sanitizeInput ---

describe('sanitizeInput', () => {
  it('escapes < and >', () => {
    expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes &', () => {
    expect(sanitizeInput('a & b')).toBe('a &amp; b');
  });

  it('escapes double quotes', () => {
    expect(sanitizeInput('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });

  it('leaves normal text unchanged', () => {
    expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

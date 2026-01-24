/**
 * API Authentication & Security Middleware
 * Provides route protection, rate limiting, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 60 * 1000, maxRequests: 60 },  // 60 req/min
  chat: { windowMs: 60 * 1000, maxRequests: 20 },     // 20 req/min (AI calls are expensive)
  upload: { windowMs: 60 * 1000, maxRequests: 10 },   // 10 req/min
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 req/15min (prevent brute force)
};

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  limitType: keyof typeof RATE_LIMITS = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[limitType];
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count, resetIn: record.resetTime - now };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientId(request: NextRequest): string {
  // Use forwarded IP in production (behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

/**
 * Verify authentication and return user info
 */
export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return { authenticated: false, error: 'Not authenticated' };
    }

    return {
      authenticated: true,
      userId: token.id as string,
      email: token.email as string,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { 
      status: 401,
      headers: {
        'WWW-Authenticate': 'Bearer',
      },
    }
  );
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { 
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(resetIn / 1000)),
        'X-RateLimit-Reset': String(Date.now() + resetIn),
      },
    }
  );
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

/**
 * Validate CSRF token (for state-changing operations)
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  if (!csrfHeader || !csrfCookie) {
    return false;
  }

  return csrfHeader === csrfCookie;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Check password strength
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Log security event for audit trail
 */
export function logSecurityEvent(event: {
  type: 'auth_success' | 'auth_failure' | 'rate_limit' | 'unauthorized' | 'suspicious';
  userId?: string;
  ip: string;
  userAgent?: string;
  details?: string;
}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...event,
  };

  // In production, send to logging service (e.g., Datadog, Splunk)
  console.log('[SECURITY]', JSON.stringify(logEntry));

  // TODO: Store in database for audit trail
}

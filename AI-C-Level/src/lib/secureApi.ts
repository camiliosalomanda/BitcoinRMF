/**
 * Secure API Route Wrapper
 * Wraps API handlers with authentication, rate limiting, and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAuth,
  checkRateLimit,
  getClientId,
  unauthorizedResponse,
  rateLimitResponse,
  addSecurityHeaders,
  logSecurityEvent,
} from './security';

type ApiHandler = (
  request: NextRequest,
  context: { userId: string; email: string }
) => Promise<NextResponse>;

interface SecureApiOptions {
  requireAuth?: boolean;
  rateLimit?: 'default' | 'chat' | 'upload' | 'auth';
  allowedMethods?: string[];
}

/**
 * Wrap an API handler with security middleware
 */
export function secureApi(
  handler: ApiHandler,
  options: SecureApiOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  const {
    requireAuth = true,
    rateLimit = 'default',
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    const clientId = getClientId(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check HTTP method
    if (!allowedMethods.includes(request.method)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
      );
    }

    // Rate limiting
    const rateLimitKey = `${clientId}:${request.nextUrl.pathname}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, rateLimit);

    if (!allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        ip: clientId,
        userAgent,
        details: `Rate limit exceeded for ${request.nextUrl.pathname}`,
      });
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    // Authentication
    if (requireAuth) {
      const auth = await verifyAuth(request);

      if (!auth.authenticated) {
        logSecurityEvent({
          type: 'unauthorized',
          ip: clientId,
          userAgent,
          details: `Unauthorized access attempt to ${request.nextUrl.pathname}`,
        });
        return addSecurityHeaders(unauthorizedResponse(auth.error));
      }

      // Call handler with authenticated context
      try {
        const response = await handler(request, {
          userId: auth.userId!,
          email: auth.email!,
        });

        // Add rate limit headers
        response.headers.set('X-RateLimit-Remaining', String(remaining));
        response.headers.set('X-RateLimit-Reset', String(Date.now() + resetIn));

        return addSecurityHeaders(response);
      } catch (error) {
        console.error('API handler error:', error);
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        );
      }
    }

    // Call handler without auth context (public endpoints)
    try {
      const response = await handler(request, { userId: '', email: '' });
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('API handler error:', error);
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      );
    }
  };
}

/**
 * Create a protected API route handler
 */
export function createProtectedRoute(
  handlers: {
    GET?: ApiHandler;
    POST?: ApiHandler;
    PUT?: ApiHandler;
    DELETE?: ApiHandler;
  },
  options: SecureApiOptions = {}
) {
  const wrappedHandlers: Record<string, (request: NextRequest) => Promise<NextResponse>> = {};

  for (const [method, handler] of Object.entries(handlers)) {
    if (handler) {
      wrappedHandlers[method] = secureApi(handler, {
        ...options,
        allowedMethods: [method],
      });
    }
  }

  return wrappedHandlers;
}

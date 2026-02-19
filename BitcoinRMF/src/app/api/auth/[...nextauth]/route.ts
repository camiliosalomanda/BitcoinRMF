import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const handler = NextAuth(authOptions);

// Wrap GET to intercept /api/auth/session in dev mode when no real login exists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function GET(req: NextRequest, ctx: any) {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.DEV_BYPASS_AUTH === 'true' &&
    req.nextUrl.pathname === '/api/auth/session'
  ) {
    const hasSession =
      req.cookies.has('next-auth.session-token') ||
      req.cookies.has('__Secure-next-auth.session-token');
    if (!hasSession) {
      return NextResponse.json({
        user: {
          xId: 'dev-admin',
          xUsername: 'dev',
          xName: 'Dev Admin',
          xProfileImage: '',
          isAdmin: true,
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }
  return handler(req, ctx);
}

export { GET, handler as POST };

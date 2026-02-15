import type { NextAuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

const ADMIN_X_IDS = (process.env.ADMIN_X_IDS || '').split(',').filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
      version: '1.0a',
      name: 'X',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        // OAuth 1.0a returns flat profile; OAuth 2.0 nests under .data
        const p = profile as Record<string, unknown>;
        if (p.data && typeof p.data === 'object') {
          // OAuth 2.0 shape
          const d = p.data as Record<string, string>;
          token.xId = d.id;
          token.xUsername = d.username;
          token.xName = d.name;
          token.xProfileImage = d.profile_image_url;
        } else {
          // OAuth 1.0a shape
          token.xId = p.id_str as string || String(p.id);
          token.xUsername = p.screen_name as string;
          token.xName = p.name as string;
          token.xProfileImage = p.profile_image_url_https as string;
        }
      }
      // Set admin flag based on X ID
      if (token.xId) {
        token.isAdmin = ADMIN_X_IDS.includes(token.xId);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.xId = token.xId as string;
        session.user.xUsername = token.xUsername as string;
        session.user.xName = token.xName as string;
        session.user.xProfileImage = token.xProfileImage as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
};

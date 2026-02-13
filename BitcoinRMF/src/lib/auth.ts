import type { NextAuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
      version: '2.0',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const twitterProfile = profile as {
          data?: {
            id?: string;
            username?: string;
            name?: string;
            profile_image_url?: string;
          };
        };
        if (twitterProfile.data) {
          token.xId = twitterProfile.data.id;
          token.xUsername = twitterProfile.data.username;
          token.xName = twitterProfile.data.name;
          token.xProfileImage = twitterProfile.data.profile_image_url;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.xId = token.xId as string;
        session.user.xUsername = token.xUsername as string;
        session.user.xName = token.xName as string;
        session.user.xProfileImage = token.xProfileImage as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

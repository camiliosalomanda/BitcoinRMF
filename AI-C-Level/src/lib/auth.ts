/**
 * NextAuth Configuration
 * 
 * Handles authentication with email/password and OAuth providers.
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        if (!supabase) {
          throw new Error('Database not configured');
        }

        // Find user by email
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email.toLowerCase())
          .single();

        if (error || !user) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
        };
      },
    }),

    // Google OAuth (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // GitHub OAuth (optional)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, create or update user in database
      if (account?.provider !== 'credentials' && supabase) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email?.toLowerCase())
          .single();

        if (!existingUser) {
          // Create new user
          await supabase.from('users').insert({
            email: user.email?.toLowerCase(),
            name: user.name || 'User',
            avatar_url: user.image,
            auth_provider: account?.provider,
          });
        }
      }
      return true;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,

  // Enable Turbopack (default in Next.js 16)
  turbopack: {},

  // Enable experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimize package imports
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      '@anthropic-ai/sdk',
    ],
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Boardroom Bridge',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Don't cache API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ];
  },

  // Rewrites for cleaner URLs
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/chat/:executive',
          destination: '/dashboard/chat/:executive',
        },
      ],
      fallback: [],
    };
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Output configuration
  output: 'standalone',

  // Powered by header - disable for security
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // Trailing slash configuration
  trailingSlash: false,

  // Use new option name instead of deprecated skipMiddlewareUrlNormalize
  skipTrailingSlashRedirect: false,
};

export default nextConfig;

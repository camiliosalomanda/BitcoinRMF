'use client';

/**
 * Onboarding Guard Component
 * Redirects users to auth or onboarding as needed
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/', '/auth/signin', '/auth/signup', '/auth/error'];

// Pages that don't require onboarding
const SKIP_ONBOARDING_PATHS = [...PUBLIC_PATHS, '/onboarding'];

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isOnboarded } = useAppStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') {
      return;
    }

    // Public paths - no checks needed
    if (PUBLIC_PATHS.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // Check authentication first
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // User is authenticated - check onboarding
    if (status === 'authenticated') {
      // Skip onboarding check for certain paths
      if (SKIP_ONBOARDING_PATHS.includes(pathname)) {
        setIsChecking(false);
        return;
      }

      // Redirect to onboarding if not completed
      if (!isOnboarded) {
        router.push('/onboarding');
        return;
      }

      setIsChecking(false);
    }
  }, [status, isOnboarded, pathname, router]);

  // Show loading state while checking
  if (isChecking && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-2xl">🏢</span>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

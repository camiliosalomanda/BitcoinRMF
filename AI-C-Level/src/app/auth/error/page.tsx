'use client';

/**
 * Authentication Error Page
 */

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to access this resource.',
  Verification: 'The verification link may have expired or already been used.',
  Default: 'An authentication error occurred.',
  CredentialsSignin: 'Invalid email or password. Please try again.',
  OAuthSignin: 'Error in OAuth sign in process.',
  OAuthCallback: 'Error in OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error in authentication callback.',
  OAuthAccountNotLinked: 'This email is already associated with another account.',
  SessionRequired: 'Please sign in to access this page.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <>
      {/* Error Icon */}
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-2xl font-bold text-white mb-4">
        Authentication Error
      </h1>
      <p className="text-gray-400 mb-8">{errorMessage}</p>

      {/* Actions */}
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Link
          href="/auth/signin"
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-center"
        >
          Try Again
        </Link>
        <Link
          href="/"
          className="w-full py-3 px-6 text-gray-400 hover:text-white font-medium transition-colors text-center"
        >
          Go Home
        </Link>
      </div>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}

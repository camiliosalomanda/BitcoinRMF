'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a server configuration problem. Contact the site administrator.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Could not start the OAuth sign-in flow. Check API credentials.',
  OAuthCallback: 'The OAuth callback returned an error.',
  OAuthAccountNotLinked: 'This account is already linked to a different sign-in method.',
  Default: 'An unexpected authentication error occurred.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Authentication Error</h1>
        <p className="text-sm text-gray-400 mb-6">
          {error ? (ERROR_MESSAGES[error] || ERROR_MESSAGES.Default) : ERROR_MESSAGES.Default}
        </p>
        {error && (
          <p className="text-[10px] text-gray-600 mb-6 font-mono">
            Error code: {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-semibold text-sm transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

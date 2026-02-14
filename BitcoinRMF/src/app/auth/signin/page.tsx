'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Twitter, Shield } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Could not start sign-in. Check that X API credentials are configured.',
  OAuthCallback: 'Sign-in callback failed. Try again.',
  OAuthAccountNotLinked: 'This account is already linked to another provider.',
  Callback: 'Something went wrong during sign-in.',
  Default: 'An unexpected error occurred.',
};

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#f7931a]/10 rounded-2xl flex items-center justify-center mb-4">
            <Shield size={24} className="text-[#f7931a]" />
          </div>
          <h1 className="text-xl font-bold text-white">Bitcoin RMF</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
            <p className="text-xs text-red-400">
              {ERROR_MESSAGES[error] || ERROR_MESSAGES.Default}
            </p>
          </div>
        )}

        {/* Sign in button */}
        <button
          onClick={() => signIn('twitter', { callbackUrl })}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-[#f7931a]/10 border border-[#2a2a3a] hover:border-[#f7931a]/30 transition-all"
        >
          <Twitter size={18} className="text-white" />
          <span className="text-sm font-medium text-gray-200">Sign in with X</span>
        </button>

        <p className="text-[10px] text-gray-600 text-center mt-4">
          Authentication is used for comments and admin features only.
          All risk data is publicly accessible.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

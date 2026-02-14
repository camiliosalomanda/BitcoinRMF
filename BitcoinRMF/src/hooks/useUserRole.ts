'use client';

import { useSession } from 'next-auth/react';

export function useUserRole() {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.isAdmin ?? false,
    isLoading: status === 'loading',
    user: session?.user ?? null,
  };
}

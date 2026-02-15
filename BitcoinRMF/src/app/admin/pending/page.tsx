'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/review');
  }, [router]);

  return null;
}

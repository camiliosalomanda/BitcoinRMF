'use client';

import { useEffect, useState } from 'react';
import { useRMFStore } from './store';

/**
 * Hook that waits for Zustand persist rehydration from localStorage,
 * then initializes seed data if needed. Returns true when ready.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);
  const { isInitialized, initializeSeedData } = useRMFStore();

  useEffect(() => {
    // Zustand persist onRehydrateStorage fires synchronously after
    // localStorage is read. By the time useEffect runs, rehydration
    // is already complete. We just need to wait one tick.
    const unsub = useRMFStore.persist.onFinishHydration(() => {
      if (!useRMFStore.getState().isInitialized) {
        initializeSeedData();
      }
      setHydrated(true);
    });

    // If already rehydrated (e.g. fast localStorage read)
    if (useRMFStore.persist.hasHydrated()) {
      if (!useRMFStore.getState().isInitialized) {
        initializeSeedData();
      }
      setHydrated(true);
    }

    return unsub;
  }, [initializeSeedData]);

  return hydrated;
}

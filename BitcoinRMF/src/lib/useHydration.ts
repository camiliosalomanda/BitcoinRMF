'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from './store';

/**
 * Hook that waits for Zustand persist rehydration from localStorage.
 * Performs one-time migration from old 'bitcoin-rmf-storage' key
 * (extracts comments) into new 'bitcoin-rmf-ui' key.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function onHydrated() {
      // One-time migration: extract comments from old localStorage key
      try {
        const oldKey = 'bitcoin-rmf-storage';
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          const oldComments = parsed?.state?.comments;
          if (Array.isArray(oldComments) && oldComments.length > 0) {
            const currentComments = useUIStore.getState().comments;
            if (currentComments.length === 0) {
              // Migrate comments
              useUIStore.setState({ comments: oldComments });
            }
          }
          localStorage.removeItem(oldKey);
        }
      } catch {
        // Migration failed, not critical
      }
      setHydrated(true);
    }

    const unsub = useUIStore.persist.onFinishHydration(onHydrated);

    if (useUIStore.persist.hasHydrated()) {
      onHydrated();
    }

    return unsub;
  }, []);

  return hydrated;
}

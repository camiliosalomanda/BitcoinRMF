'use client';

import { useState, useRef, useCallback } from 'react';
import { CommentAuthor } from '@/types';
import { useUIStore } from '@/lib/store';

const DEBOUNCE_MS = 400;
const MAX_RESULTS = 5;
const MIN_API_QUERY_LENGTH = 2;

export function useMentionSearch() {
  const [results, setResults] = useState<CommentAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const getUniqueAuthors = useUIStore((s) => s.getUniqueAuthors);

  const search = useCallback(
    (query: string) => {
      // Cancel any pending debounce/fetch
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();

      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      const lowerQ = query.toLowerCase();

      // Local search — instant
      const localAuthors = getUniqueAuthors();
      const localMatches = localAuthors.filter(
        (a) =>
          a.xUsername.toLowerCase().includes(lowerQ) ||
          a.xName.toLowerCase().includes(lowerQ)
      );

      setResults(localMatches.slice(0, MAX_RESULTS));

      // Query too short for API lookup
      if (query.length < MIN_API_QUERY_LENGTH) {
        setLoading(false);
        return;
      }

      // Debounced API search
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const res = await fetch(
            `/api/x/search-users?q=${encodeURIComponent(query)}`,
            { signal: controller.signal }
          );

          if (!res.ok) {
            setLoading(false);
            return;
          }

          const json = await res.json();
          const apiUsers: CommentAuthor[] = json.users || [];

          // Merge: local first, then API (deduplicated)
          const seenIds = new Set(localMatches.map((a) => a.xId));
          const merged = [...localMatches];
          for (const u of apiUsers) {
            if (!seenIds.has(u.xId)) {
              seenIds.add(u.xId);
              merged.push(u);
            }
            if (merged.length >= MAX_RESULTS) break;
          }

          setResults(merged);
        } catch {
          // Keep local results on error (including abort)
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [getUniqueAuthors]
  );

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    setResults([]);
    setLoading(false);
  }, []);

  return { results, loading, search, clear };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Quest, DifficultyLevel, QuestCategory, RecoveryLevel } from '@/types';

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    difficulty?: DifficultyLevel;
    category?: QuestCategory;
    recovery_level?: RecoveryLevel;
  }>({});

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.category) params.set('category', filters.category);
      if (filters.recovery_level) params.set('recovery_level', filters.recovery_level);

      const res = await fetch(`/api/quests?${params}`);
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch quests:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  return { quests, loading, filters, setFilters, refresh: fetchQuests };
}

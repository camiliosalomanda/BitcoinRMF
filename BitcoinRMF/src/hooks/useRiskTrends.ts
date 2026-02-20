'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types';

export interface RiskSnapshot {
  date: string;
  stats: DashboardStats;
}

export function useRiskTrends(days: number = 30) {
  return useQuery<RiskSnapshot[]>({
    queryKey: ['risk-trends', days],
    queryFn: () =>
      apiClient<RiskSnapshot[]>('/api/dashboard/trends', {
        params: { days: String(days) },
      }),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

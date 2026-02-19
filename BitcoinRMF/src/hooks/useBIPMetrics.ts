'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BIPMetricsData } from '@/lib/bip-metrics';

export type { BIPMetricsData };

export function useBIPMetrics(bipId: string) {
  return useQuery<BIPMetricsData>({
    queryKey: ['bip-metrics', bipId],
    queryFn: () => apiClient<BIPMetricsData>(`/api/bips/${bipId}/metrics`),
    enabled: !!bipId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

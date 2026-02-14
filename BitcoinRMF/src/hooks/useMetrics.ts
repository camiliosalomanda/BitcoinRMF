'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BitcoinMetrics } from '@/app/api/metrics/route';

export type { BitcoinMetrics };

export function useBitcoinMetrics() {
  return useQuery<BitcoinMetrics>({
    queryKey: ['bitcoin-metrics'],
    queryFn: () => apiClient<BitcoinMetrics>('/api/metrics'),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000,       // 4 minutes
  });
}

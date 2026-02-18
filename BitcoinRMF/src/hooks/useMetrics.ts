'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BitcoinMetrics } from '@/app/api/metrics/route';

export type { BitcoinMetrics };

export function useBitcoinMetrics() {
  return useQuery<BitcoinMetrics>({
    queryKey: ['bitcoin-metrics'],
    queryFn: () => apiClient<BitcoinMetrics>('/api/metrics'),
    refetchInterval: 2 * 60 * 1000, // 2 minutes (matches server cache TTL)
    staleTime: 90 * 1000,           // 90 seconds
  });
}

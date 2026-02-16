'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { DerivedRisk } from '@/types';

export function useRisks() {
  return useQuery<DerivedRisk[]>({
    queryKey: ['risks'],
    queryFn: () => apiClient<DerivedRisk[]>('/api/risks'),
  });
}

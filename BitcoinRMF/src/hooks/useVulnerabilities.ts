'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Vulnerability } from '@/types';

interface VulnerabilityFilters {
  severity?: string;
  status?: string;
  component?: string;
}

export function useVulnerabilities(filters?: VulnerabilityFilters) {
  return useQuery<Vulnerability[]>({
    queryKey: ['vulnerabilities', filters],
    queryFn: () =>
      apiClient<Vulnerability[]>('/api/vulnerabilities', {
        params: {
          severity: filters?.severity || '',
          status: filters?.status || '',
          component: filters?.component || '',
        },
      }),
  });
}

export function useVulnerability(id: string) {
  return useQuery<Vulnerability>({
    queryKey: ['vulnerabilities', id],
    queryFn: () => apiClient<Vulnerability>(`/api/vulnerabilities/${id}`),
    enabled: !!id,
  });
}

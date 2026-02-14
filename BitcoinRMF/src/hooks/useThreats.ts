'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Threat } from '@/types';
import type { ThreatInput } from '@/lib/validators';

interface ThreatFilters {
  stride?: string;
  source?: string;
  rating?: string;
  status?: string;
}

export function useThreats(filters?: ThreatFilters) {
  return useQuery<Threat[]>({
    queryKey: ['threats', filters],
    queryFn: () =>
      apiClient<Threat[]>('/api/threats', {
        params: {
          stride: filters?.stride || '',
          source: filters?.source || '',
          rating: filters?.rating || '',
          status: filters?.status || '',
        },
      }),
  });
}

export function useThreat(id: string) {
  return useQuery<Threat>({
    queryKey: ['threats', id],
    queryFn: () => apiClient<Threat>(`/api/threats/${id}`),
    enabled: !!id,
  });
}

export function useCreateThreat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ThreatInput) =>
      apiClient<Threat>('/api/threats', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateThreat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<ThreatInput> & { id: string }) =>
      apiClient<Threat>(`/api/threats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['threats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

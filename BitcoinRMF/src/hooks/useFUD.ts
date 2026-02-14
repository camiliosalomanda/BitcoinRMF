'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FUDAnalysis } from '@/types';
import type { FUDInput } from '@/lib/validators';

export function useFUD() {
  return useQuery<FUDAnalysis[]>({
    queryKey: ['fud'],
    queryFn: () => apiClient<FUDAnalysis[]>('/api/fud'),
  });
}

export function useFUDItem(id: string) {
  return useQuery<FUDAnalysis>({
    queryKey: ['fud', id],
    queryFn: () => apiClient<FUDAnalysis>(`/api/fud/${id}`),
    enabled: !!id,
  });
}

export function useCreateFUD() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FUDInput) =>
      apiClient<FUDAnalysis>('/api/fud', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fud'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateFUD() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<FUDInput> & { id: string }) =>
      apiClient<FUDAnalysis>(`/api/fud/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fud'] });
      queryClient.invalidateQueries({ queryKey: ['fud', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

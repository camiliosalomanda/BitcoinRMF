'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BIPEvaluation } from '@/types';
import type { BIPInput } from '@/lib/validators';

export function useBIPs() {
  return useQuery<BIPEvaluation[]>({
    queryKey: ['bips'],
    queryFn: () => apiClient<BIPEvaluation[]>('/api/bips'),
  });
}

export function useBIP(id: string) {
  return useQuery<BIPEvaluation>({
    queryKey: ['bips', id],
    queryFn: () => apiClient<BIPEvaluation>(`/api/bips/${id}`),
    enabled: !!id,
  });
}

export function useCreateBIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BIPInput) =>
      apiClient<BIPEvaluation>('/api/bips', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateBIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<BIPInput> & { id: string }) =>
      apiClient<BIPEvaluation>(`/api/bips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['bips', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

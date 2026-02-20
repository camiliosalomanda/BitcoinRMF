'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface XPost {
  id: string;
  post_id: string | null;
  content: string;
  trigger_type: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  error_message: string | null;
  retry_count: number;
  posted_at: string | null;
  created_at: string;
}

export function useXPosts(limit: number = 20) {
  return useQuery<XPost[]>({
    queryKey: ['x-posts', limit],
    queryFn: () =>
      apiClient<XPost[]>('/api/dashboard/x-posts', {
        params: { limit: String(limit) },
      }),
    staleTime: 60 * 1000, // 1 min
  });
}

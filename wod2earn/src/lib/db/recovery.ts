import { supabaseAdmin } from '@/lib/supabase';
import type { UserRecoveryScore } from '@/types';

export async function getLatestRecoveryScore(
  userId: string,
  date?: string
): Promise<UserRecoveryScore | null> {
  if (!supabaseAdmin) return null;
  const scoredDate = date ?? new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('user_recovery_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('scored_date', scoredDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as unknown as UserRecoveryScore | null;
}

export async function saveRecoveryScore(
  userId: string,
  score: number,
  source: string,
  rawData?: Record<string, unknown>
): Promise<UserRecoveryScore | null> {
  if (!supabaseAdmin) return null;
  const scoredDate = new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('user_recovery_scores')
    .upsert(
      {
        user_id: userId,
        score,
        source,
        scored_date: scoredDate,
        raw_data: rawData ?? null,
      },
      { onConflict: 'user_id,scored_date,source' }
    )
    .select()
    .single();

  if (error) return null;
  return data as unknown as UserRecoveryScore;
}

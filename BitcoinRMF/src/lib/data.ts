import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { threatFromRow, bipFromRow, fudFromRow, type ThreatRow, type BIPRow, type FUDRow } from '@/lib/transform';
import { SEED_THREATS, SEED_BIPS, SEED_FUD } from '@/lib/seed-data';
import type { Threat, BIPEvaluation, FUDAnalysis } from '@/types';

export async function getThreatById(id: string): Promise<Threat | null> {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    return SEED_THREATS.find((t) => t.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('threats')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return SEED_THREATS.find((t) => t.id === id) ?? null;
  return threatFromRow(data as ThreatRow);
}

export async function getBIPById(id: string): Promise<BIPEvaluation | null> {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    return SEED_BIPS.find((b) => b.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('bip_evaluations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return SEED_BIPS.find((b) => b.id === id) ?? null;
  return bipFromRow(data as BIPRow);
}

export async function getFUDById(id: string): Promise<FUDAnalysis | null> {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    return SEED_FUD.find((f) => f.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('fud_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return SEED_FUD.find((f) => f.id === id) ?? null;
  return fudFromRow(data as FUDRow);
}

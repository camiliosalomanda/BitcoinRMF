import { supabaseAdmin } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export async function getUserById(id: string): Promise<UserProfile | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, username, display_name, avatar_url, level, current_xp, total_xp, streak_count, longest_streak, last_workout_date, workouts_completed, subscription_tier, height_cm, weight_kg, body_type, date_of_birth, gender, fitness_goal, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as UserProfile;
}

export async function getUserByEmail(email: string) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
}

export async function getUserByUsername(username: string) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  if (error) return null;
  return data;
}

export async function createUser(params: {
  email: string;
  username: string;
  display_name: string;
  password_hash: string;
}) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(id: string, updates: Record<string, unknown>) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addXP(userId: string, xpAmount: number) {
  if (!supabaseAdmin) return null;

  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  const newCurrentXP = user.current_xp + xpAmount;
  const newTotalXP = user.total_xp + xpAmount;

  // Check for level up
  const { checkLevelUp } = await import('@/lib/xp');
  const { newLevel, newXP, levelsGained } = checkLevelUp(newCurrentXP, user.level);

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      current_xp: newXP,
      total_xp: newTotalXP,
      level: newLevel,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return { user: data, levelsGained, newLevel };
}

import { supabaseAdmin } from '@/lib/supabase';
import type { Quest, DifficultyLevel, QuestCategory, RecoveryLevel, DailyQuestAssignment } from '@/types';
import { RECOVERY_TIER_ORDER } from '@/lib/recovery';

export async function getAllQuests(filters?: {
  difficulty?: DifficultyLevel;
  category?: QuestCategory;
  recovery_level?: RecoveryLevel;
}): Promise<Quest[]> {
  if (!supabaseAdmin) return [];
  let query = supabaseAdmin.from('quests').select('*').eq('is_active', true);

  if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.recovery_level) query = query.eq('recovery_level', filters.recovery_level);

  const { data, error } = await query.order('difficulty');
  if (error) return [];
  return data as unknown as Quest[];
}

export async function getQuestById(id: string): Promise<Quest | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('quests')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as unknown as Quest;
}

export async function getDailyQuests(userId: string, date?: string): Promise<DailyQuestAssignment[]> {
  if (!supabaseAdmin) return [];
  const assignedDate = date ?? new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('daily_quest_assignments')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .eq('assigned_date', assignedDate);

  if (error) return [];
  return data as unknown as DailyQuestAssignment[];
}

export async function assignDailyQuests(userId: string): Promise<DailyQuestAssignment[]> {
  if (!supabaseAdmin) return [];
  const today = new Date().toISOString().split('T')[0];

  // Check if already assigned
  const existing = await getDailyQuests(userId, today);
  if (existing.length > 0) return existing;

  // Pick one random quest per recovery tier
  const assignments: { user_id: string; quest_id: string; assigned_date: string; recovery_level: RecoveryLevel }[] = [];

  for (const tier of RECOVERY_TIER_ORDER) {
    const { data: quests, error } = await supabaseAdmin
      .from('quests')
      .select('id')
      .eq('is_active', true)
      .eq('recovery_level', tier);

    if (error || !quests || quests.length === 0) continue;

    const randomIndex = Math.floor(Math.random() * quests.length);
    assignments.push({
      user_id: userId,
      quest_id: quests[randomIndex].id,
      assigned_date: today,
      recovery_level: tier,
    });
  }

  if (assignments.length === 0) return [];

  const { error } = await supabaseAdmin
    .from('daily_quest_assignments')
    .insert(assignments);

  if (error) return [];
  return getDailyQuests(userId, today);
}

export async function selectDailyQuest(userId: string, questId: string): Promise<DailyQuestAssignment | null> {
  if (!supabaseAdmin) return null;
  const today = new Date().toISOString().split('T')[0];

  // Deselect all for today
  await supabaseAdmin
    .from('daily_quest_assignments')
    .update({ selected: false })
    .eq('user_id', userId)
    .eq('assigned_date', today);

  // Select the chosen one
  const { data, error } = await supabaseAdmin
    .from('daily_quest_assignments')
    .update({ selected: true })
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .eq('assigned_date', today)
    .select('*, quest:quests(*)')
    .single();

  if (error) return null;
  return data as unknown as DailyQuestAssignment;
}

export async function completeDailyQuest(userId: string, questId: string) {
  if (!supabaseAdmin) return null;
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('daily_quest_assignments')
    .update({ completed: true, selected: true, completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .eq('assigned_date', today)
    .select()
    .single();

  if (error) return null;
  return data;
}

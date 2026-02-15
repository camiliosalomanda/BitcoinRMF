export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  current_xp: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  last_workout_date: string | null;
  workouts_completed: number;
  subscription_tier: SubscriptionTier;
  height_cm: number | null;
  weight_kg: number | null;
  body_type: BodyType | null;
  date_of_birth: string | null;
  gender: Gender | null;
  fitness_goal: FitnessGoal | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdatePayload {
  display_name?: string;
  avatar_url?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  body_type?: BodyType | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  fitness_goal?: FitnessGoal | null;
}

export type SubscriptionTier = 'free' | 'pro' | 'elite';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type QuestCategory = 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'mixed';
export type RecoveryLevel = 'low' | 'medium' | 'high';
export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'maintain' | 'endurance';

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  weight_kg?: number;
  distance_meters?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: DifficultyLevel;
  recovery_level: RecoveryLevel;
  xp_reward: number;
  exercises: Exercise[];
  estimated_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  quest_id: string | null;
  title: string;
  exercises: Exercise[];
  duration_seconds: number;
  xp_earned: number;
  difficulty: DifficultyLevel;
  notes: string | null;
  completed_at: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement?: Achievement;
  unlocked_at: string;
}

export interface DailyQuestAssignment {
  id: string;
  user_id: string;
  quest_id: string;
  quest?: Quest;
  assigned_date: string;
  recovery_level: RecoveryLevel;
  selected: boolean;
  completed: boolean;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  value: number; // xp or streak count depending on tab
}

export interface WeeklyXP {
  id: string;
  user_id: string;
  week_start: string;
  xp_earned: number;
}

export type GuildRole = 'admin' | 'moderator' | 'member';

export interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: GuildRole;
  joined_at: string;
}

export interface GuildWithRole extends Guild {
  role: GuildRole;
}

export interface GuildMemberEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  role: GuildRole;
  joined_at: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number;
  progressPercent: number;
  totalXP: number;
}

export interface UserRecoveryScore {
  id: string;
  user_id: string;
  score: number;
  source: string;
  scored_date: string;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface RecoveryRecommendation {
  level: RecoveryLevel;
  score: number | null;
  source: string | null;
  confidence: 'data' | 'none';
}

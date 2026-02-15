-- WOD2EARN Database Schema
-- Run this in your Supabase SQL Editor

-- Enums
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'elite');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE quest_category AS ENUM ('strength', 'cardio', 'flexibility', 'endurance', 'mixed');
CREATE TYPE guild_role AS ENUM ('admin', 'moderator', 'member');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date DATE,
  workouts_completed INTEGER NOT NULL DEFAULT 0,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category quest_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  xp_reward INTEGER NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  estimated_minutes INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  duration_seconds INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity achievement_rarity NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Achievements (join table)
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Daily Quest Assignments
CREATE TABLE daily_quest_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id, assigned_date)
);

-- Weekly XP tracking
CREATE TABLE weekly_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, week_start)
);

-- Guilds
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guild Members
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role guild_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_guilds_slug ON guilds(slug);
CREATE INDEX idx_guilds_member_count ON guilds(member_count DESC);
CREATE INDEX idx_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX idx_guild_members_user_id ON guild_members(user_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_completed_at ON workouts(completed_at DESC);
CREATE INDEX idx_workouts_user_completed ON workouts(user_id, completed_at DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_daily_quests_user_date ON daily_quest_assignments(user_id, assigned_date);
CREATE INDEX idx_weekly_xp_user_week ON weekly_xp(user_id, week_start);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_users_streak ON users(streak_count DESC);
CREATE INDEX idx_users_username ON users(username);

-- Views
CREATE OR REPLACE VIEW leaderboard_total_xp AS
SELECT
  id AS user_id,
  username,
  display_name,
  avatar_url,
  level,
  total_xp
FROM users
ORDER BY total_xp DESC
LIMIT 100;

CREATE OR REPLACE VIEW leaderboard_streaks AS
SELECT
  id AS user_id,
  username,
  display_name,
  avatar_url,
  level,
  streak_count
FROM users
WHERE streak_count > 0
ORDER BY streak_count DESC
LIMIT 100;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER guilds_updated_at
  BEFORE UPDATE ON guilds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quest_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_xp ENABLE ROW LEVEL SECURITY;

-- Users: read own profile, public read for leaderboard fields
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Workouts: user-scoped
CREATE POLICY "Users can read own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Achievements: user-scoped read, service-role insert
CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Daily Quest Assignments: user-scoped
CREATE POLICY "Users can read own daily quests"
  ON daily_quest_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- Weekly XP: user-scoped read
CREATE POLICY "Users can read own weekly xp"
  ON weekly_xp FOR SELECT
  USING (auth.uid() = user_id);

-- Quests: public read
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests are publicly readable"
  ON quests FOR SELECT
  USING (true);

-- Achievements: public read
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are publicly readable"
  ON achievements FOR SELECT
  USING (true);

-- Guilds: public read (like leaderboard), writes via service role
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guilds are publicly readable"
  ON guilds FOR SELECT
  USING (true);

-- Guild Members: public read, writes via service role
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guild members are publicly readable"
  ON guild_members FOR SELECT
  USING (true);

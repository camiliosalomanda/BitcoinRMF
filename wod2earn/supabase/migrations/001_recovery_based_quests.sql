-- Migration: Recovery-Based Daily Quest System
-- Adds recovery_level to quests and daily assignments, creates user_recovery_scores table

-- 1. Create recovery_level enum
CREATE TYPE recovery_level AS ENUM ('low', 'medium', 'high');

-- 2. Add recovery_level to quests table (default 'high', existing quests become high)
ALTER TABLE quests ADD COLUMN recovery_level recovery_level NOT NULL DEFAULT 'high';

-- 3. Add recovery_level and selected columns to daily_quest_assignments
ALTER TABLE daily_quest_assignments ADD COLUMN recovery_level recovery_level;
ALTER TABLE daily_quest_assignments ADD COLUMN selected BOOLEAN NOT NULL DEFAULT false;

-- 4. Drop old unique constraint and add new one
ALTER TABLE daily_quest_assignments DROP CONSTRAINT IF EXISTS daily_quest_assignments_user_id_quest_id_assigned_date_key;
ALTER TABLE daily_quest_assignments ADD CONSTRAINT daily_quest_assignments_user_recovery_date_key
  UNIQUE (user_id, recovery_level, assigned_date);

-- 5. Create user_recovery_scores table for wearable integration
CREATE TABLE user_recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  source TEXT NOT NULL DEFAULT 'manual',
  scored_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scored_date, source)
);

-- 6. Indexes
CREATE INDEX idx_recovery_scores_user_date ON user_recovery_scores(user_id, scored_date DESC);
CREATE INDEX idx_quests_recovery_level ON quests(recovery_level);
CREATE INDEX idx_daily_quests_recovery ON daily_quest_assignments(user_id, assigned_date, recovery_level);

-- 7. RLS Policies for user_recovery_scores
ALTER TABLE user_recovery_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recovery scores"
  ON user_recovery_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery scores"
  ON user_recovery_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. Backfill recovery_level on daily_quest_assignments from their quest
UPDATE daily_quest_assignments dqa
SET recovery_level = q.recovery_level
FROM quests q
WHERE dqa.quest_id = q.id AND dqa.recovery_level IS NULL;

-- Migration: Recovery-Based Daily Quest System
-- Adds recovery_level to quests and daily assignments, creates user_recovery_scores table

-- 1. Create recovery_level enum
CREATE TYPE recovery_level AS ENUM ('low', 'medium', 'high');

-- 2. Add recovery_level to quests table (default 'high', existing quests become high)
ALTER TABLE quests ADD COLUMN recovery_level recovery_level NOT NULL DEFAULT 'high';

-- 3. Clear old daily assignments (ephemeral data, regenerated on next login)
--    Required because old rows are all recovery_level='high' and would violate the new 1-per-tier constraint
DELETE FROM daily_quest_assignments;

-- 4. Add recovery_level and selected columns to daily_quest_assignments
ALTER TABLE daily_quest_assignments ADD COLUMN recovery_level recovery_level;
ALTER TABLE daily_quest_assignments ADD COLUMN selected BOOLEAN NOT NULL DEFAULT false;

-- 5. Drop old unique constraint and add new one
ALTER TABLE daily_quest_assignments DROP CONSTRAINT IF EXISTS daily_quest_assignments_user_id_quest_id_assigned_date_key;
ALTER TABLE daily_quest_assignments ADD CONSTRAINT daily_quest_assignments_user_recovery_date_key
  UNIQUE (user_id, recovery_level, assigned_date);

-- 6. Create user_recovery_scores table for wearable integration
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

-- 7. Indexes
CREATE INDEX idx_recovery_scores_user_date ON user_recovery_scores(user_id, scored_date DESC);
CREATE INDEX idx_quests_recovery_level ON quests(recovery_level);
CREATE INDEX idx_daily_quests_recovery ON daily_quest_assignments(user_id, assigned_date, recovery_level);

-- 8. RLS Policies for user_recovery_scores
ALTER TABLE user_recovery_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recovery scores"
  ON user_recovery_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery scores"
  ON user_recovery_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- (No backfill needed — old assignments were cleared in step 3)

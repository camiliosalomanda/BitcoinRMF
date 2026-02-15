-- Add body_measurements JSONB column for optional detailed measurements
-- Used by AI avatar generation to build more accurate body proportions
-- Keys: chest_cm, waist_cm, hips_cm, shoulders_cm, arm_cm, thigh_cm
ALTER TABLE users ADD COLUMN body_measurements JSONB;

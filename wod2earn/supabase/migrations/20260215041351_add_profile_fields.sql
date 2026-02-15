-- Create enums
CREATE TYPE body_type AS ENUM ('ectomorph', 'mesomorph', 'endomorph');
CREATE TYPE gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE fitness_goal AS ENUM ('lose_weight', 'build_muscle', 'maintain', 'endurance');

-- Add profile columns to users table
ALTER TABLE users ADD COLUMN height_cm NUMERIC(5,1);
ALTER TABLE users ADD COLUMN weight_kg NUMERIC(5,1);
ALTER TABLE users ADD COLUMN body_type body_type;
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN gender gender;
ALTER TABLE users ADD COLUMN fitness_goal fitness_goal;

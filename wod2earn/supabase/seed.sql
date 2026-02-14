-- WOD2EARN Seed Data
-- Run this after schema.sql and migrations in your Supabase SQL Editor

-- Seed Quests (existing 10 tagged as recovery_level = 'high', plus 10 new recovery quests)

-- Rest Day / Low Recovery (5)
INSERT INTO quests (title, description, category, difficulty, recovery_level, xp_reward, exercises, estimated_minutes) VALUES
('Gentle Morning Stretch', 'A calm, guided stretch to start your day. Focus on breathing and gentle movement.', 'flexibility', 'beginner', 'low', 15,
  '[{"name":"Neck Rolls","duration_seconds":60},{"name":"Cat-Cow Stretch","duration_seconds":90},{"name":"Seated Forward Fold","duration_seconds":60},{"name":"Gentle Twist","duration_seconds":60}]', 10),
('Meditation & Mindfulness', 'A guided meditation session to reduce stress and support mental recovery.', 'flexibility', 'beginner', 'low', 20,
  '[{"name":"Box Breathing","duration_seconds":180},{"name":"Body Scan Meditation","duration_seconds":300},{"name":"Gratitude Journaling","duration_seconds":300}]', 15),
('Foam Rolling Recovery', 'Self-myofascial release to ease muscle tension and improve circulation.', 'flexibility', 'beginner', 'low', 20,
  '[{"name":"Foam Roll Quads","duration_seconds":120},{"name":"Foam Roll IT Band","duration_seconds":120},{"name":"Foam Roll Upper Back","duration_seconds":120},{"name":"Foam Roll Calves","duration_seconds":120}]', 10),
('Evening Wind Down', 'A soothing routine to relax before bed. Perfect for rest days.', 'flexibility', 'beginner', 'low', 15,
  '[{"name":"Legs Up The Wall","duration_seconds":180},{"name":"Supine Spinal Twist","duration_seconds":120},{"name":"Deep Breathing","duration_seconds":180}]', 10),
('Walk & Breathe', 'A light walk with breathing exercises. Get fresh air and keep moving gently.', 'cardio', 'beginner', 'low', 25,
  '[{"name":"Easy Walk","duration_seconds":1200,"distance_meters":1500},{"name":"Walking Breathing Drill","duration_seconds":300}]', 25);

-- Active Recovery / Medium (5)
INSERT INTO quests (title, description, category, difficulty, recovery_level, xp_reward, exercises, estimated_minutes) VALUES
('Yoga Flow', 'A moderate vinyasa flow to build flexibility and keep your body active.', 'flexibility', 'beginner', 'medium', 45,
  '[{"name":"Sun Salutation A","sets":3,"reps":1},{"name":"Warrior I to Warrior II Flow","sets":2,"reps":5},{"name":"Downward Dog to Cobra","sets":3,"reps":1},{"name":"Tree Pose Hold","duration_seconds":60}]', 30),
('Easy Swim', 'A relaxed swim session to move joints without impact stress.', 'cardio', 'beginner', 'medium', 50,
  '[{"name":"Freestyle Laps","duration_seconds":1200,"distance_meters":500},{"name":"Backstroke Cooldown","duration_seconds":600,"distance_meters":200}]', 30),
('Mobility Circuit', 'Joint mobility and dynamic stretching to maintain range of motion.', 'flexibility', 'beginner', 'medium', 40,
  '[{"name":"Hip Circles","sets":2,"reps":10},{"name":"Arm Circles","sets":2,"reps":15},{"name":"Ankle Circles","sets":2,"reps":10},{"name":"Thoracic Spine Rotation","sets":2,"reps":8},{"name":"Inchworms","sets":2,"reps":6}]', 20),
('Light Cycle', 'An easy bike ride to keep blood flowing. Keep effort conversational.', 'cardio', 'beginner', 'medium', 55,
  '[{"name":"Easy Cycling","duration_seconds":1800,"distance_meters":8000},{"name":"Leg Stretch Cooldown","duration_seconds":300}]', 35),
('Band Work & Core', 'Resistance band exercises with light core activation.', 'strength', 'beginner', 'medium', 45,
  '[{"name":"Band Pull-Aparts","sets":3,"reps":15},{"name":"Band Face Pulls","sets":3,"reps":12},{"name":"Dead Bugs","sets":3,"reps":10},{"name":"Bird Dogs","sets":3,"reps":8}]', 20);

-- Full WOD / High Recovery (10 original quests)
INSERT INTO quests (title, description, category, difficulty, recovery_level, xp_reward, exercises, estimated_minutes) VALUES
('First Steps', 'A simple bodyweight workout to get you started. Perfect for beginners.', 'strength', 'beginner', 'high', 50,
  '[{"name":"Push-ups","sets":3,"reps":10},{"name":"Bodyweight Squats","sets":3,"reps":15},{"name":"Plank","duration_seconds":30}]', 15),
('Easy Runner', 'A light jog to build your cardio base. Keep it conversational.', 'cardio', 'beginner', 'high', 40,
  '[{"name":"Light Jog","duration_seconds":1200,"distance_meters":2000},{"name":"Walking Cooldown","duration_seconds":300}]', 25),
('Stretch & Flow', 'A relaxing flexibility session to improve mobility and reduce stress.', 'flexibility', 'beginner', 'high', 35,
  '[{"name":"Hamstring Stretch","duration_seconds":60},{"name":"Hip Flexor Stretch","duration_seconds":60},{"name":"Shoulder Stretch","duration_seconds":60},{"name":"Child''s Pose","duration_seconds":60}]', 10),
('Iron Forge', 'A solid strength training session targeting major muscle groups.', 'strength', 'intermediate', 'high', 100,
  '[{"name":"Barbell Bench Press","sets":4,"reps":8,"weight_kg":60},{"name":"Barbell Rows","sets":4,"reps":8,"weight_kg":50},{"name":"Dumbbell Shoulder Press","sets":3,"reps":10,"weight_kg":20},{"name":"Bicep Curls","sets":3,"reps":12,"weight_kg":12}]', 40),
('HIIT Blitz', 'High-intensity interval training to torch calories and boost endurance.', 'cardio', 'intermediate', 'high', 90,
  '[{"name":"Burpees","sets":4,"reps":10},{"name":"Mountain Climbers","sets":4,"reps":20},{"name":"Jump Squats","sets":4,"reps":15},{"name":"High Knees","duration_seconds":60}]', 25),
('Endurance Builder', 'Sustained effort training to build your aerobic capacity.', 'endurance', 'intermediate', 'high', 85,
  '[{"name":"Steady-State Run","duration_seconds":1800,"distance_meters":5000},{"name":"Cooldown Walk","duration_seconds":300}]', 35),
('Power Hour', 'Heavy compound lifts for serious strength gains. Not for the faint-hearted.', 'strength', 'advanced', 'high', 175,
  '[{"name":"Deadlift","sets":5,"reps":5,"weight_kg":100},{"name":"Back Squat","sets":5,"reps":5,"weight_kg":90},{"name":"Overhead Press","sets":4,"reps":6,"weight_kg":50},{"name":"Weighted Pull-ups","sets":4,"reps":6,"weight_kg":15},{"name":"Barbell Hip Thrust","sets":3,"reps":10,"weight_kg":80}]', 60),
('Inferno Circuit', 'A brutal mixed circuit combining strength and cardio. Prepare to sweat.', 'mixed', 'advanced', 'high', 160,
  '[{"name":"Kettlebell Swings","sets":5,"reps":15,"weight_kg":24},{"name":"Box Jumps","sets":4,"reps":12},{"name":"Battle Ropes","duration_seconds":45},{"name":"Rowing Machine","duration_seconds":300,"distance_meters":1000},{"name":"Burpee Pull-ups","sets":3,"reps":8}]', 45),
('Spartan Trial', 'An elite-level challenge that tests every aspect of your fitness. Only for the worthy.', 'mixed', 'elite', 'high', 300,
  '[{"name":"Clean & Jerk","sets":5,"reps":3,"weight_kg":80},{"name":"Muscle-ups","sets":4,"reps":5},{"name":"Pistol Squats","sets":3,"reps":8},{"name":"400m Sprint","sets":4,"distance_meters":400},{"name":"Handstand Push-ups","sets":3,"reps":8},{"name":"L-Sit Hold","duration_seconds":30}]', 75),
('Marathon Gauntlet', 'Push your endurance to the absolute limit. A legendary challenge for the elite.', 'endurance', 'elite', 'high', 350,
  '[{"name":"Long Distance Run","duration_seconds":5400,"distance_meters":15000},{"name":"Cooldown & Stretch","duration_seconds":600}]', 100);

-- Seed Achievements
INSERT INTO achievements (name, description, icon, rarity, requirement_type, requirement_value, xp_reward) VALUES
('First Blood', 'Complete your first workout', E'\U0001F4AA', 'common', 'workouts_completed', 1, 25),
('Dedicated', 'Complete 10 workouts', E'\U0001F3CB', 'common', 'workouts_completed', 10, 50),
('Iron Will', 'Complete 50 workouts', E'\U0001F6E1', 'rare', 'workouts_completed', 50, 150),
('Centurion', 'Complete 100 workouts', E'\u2694', 'epic', 'workouts_completed', 100, 300),
('Legendary Grinder', 'Complete 500 workouts', E'\U0001F451', 'legendary', 'workouts_completed', 500, 1000),
('On Fire', 'Reach a 3-day streak', E'\U0001F525', 'common', 'streak_count', 3, 30),
('Week Warrior', 'Reach a 7-day streak', E'\U0001F4A5', 'rare', 'streak_count', 7, 100),
('Unstoppable', 'Reach a 30-day streak', E'\u26A1', 'epic', 'streak_count', 30, 500),
('Immortal Flame', 'Reach a 100-day streak', E'\u2B50', 'legendary', 'longest_streak', 100, 2000),
('Rookie No More', 'Reach Level 5', E'\U0001F396', 'common', 'level', 5, 50),
('Rising Warrior', 'Reach Level 10', E'\U0001F31F', 'rare', 'level', 10, 100),
('Elite Status', 'Reach Level 25', E'\U0001F48E', 'epic', 'level', 25, 500),
('Living Legend', 'Reach Level 50', E'\U0001F3C6', 'legendary', 'level', 50, 2500),
('XP Collector', 'Earn 1,000 total XP', E'\U0001F4B0', 'common', 'total_xp', 1000, 25),
('XP Hoarder', 'Earn 10,000 total XP', E'\U0001F4B8', 'rare', 'total_xp', 10000, 100),
('XP Magnate', 'Earn 50,000 total XP', E'\U0001F3F0', 'epic', 'total_xp', 50000, 500),
('XP Overlord', 'Earn 100,000 total XP', E'\U0001F30B', 'legendary', 'total_xp', 100000, 2000);

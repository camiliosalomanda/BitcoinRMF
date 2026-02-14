export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          password_hash: string;
          avatar_url: string | null;
          level: number;
          current_xp: number;
          total_xp: number;
          streak_count: number;
          longest_streak: number;
          last_workout_date: string | null;
          workouts_completed: number;
          subscription_tier: 'free' | 'pro' | 'elite';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          display_name: string;
          password_hash: string;
          avatar_url?: string | null;
          level?: number;
          current_xp?: number;
          total_xp?: number;
          streak_count?: number;
          longest_streak?: number;
          last_workout_date?: string | null;
          workouts_completed?: number;
          subscription_tier?: 'free' | 'pro' | 'elite';
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string;
          password_hash?: string;
          avatar_url?: string | null;
          level?: number;
          current_xp?: number;
          total_xp?: number;
          streak_count?: number;
          longest_streak?: number;
          last_workout_date?: string | null;
          workouts_completed?: number;
          subscription_tier?: 'free' | 'pro' | 'elite';
        };
        Relationships: [];
      };
      quests: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'mixed';
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          recovery_level: 'low' | 'medium' | 'high';
          xp_reward: number;
          exercises: Record<string, unknown>[];
          estimated_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'mixed';
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          recovery_level?: 'low' | 'medium' | 'high';
          xp_reward: number;
          exercises: Record<string, unknown>[];
          estimated_minutes: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'mixed';
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          recovery_level?: 'low' | 'medium' | 'high';
          xp_reward?: number;
          exercises?: Record<string, unknown>[];
          estimated_minutes?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string | null;
          title: string;
          exercises: Record<string, unknown>[];
          duration_seconds: number;
          xp_earned: number;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          notes: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_id?: string | null;
          title: string;
          exercises: Record<string, unknown>[];
          duration_seconds: number;
          xp_earned: number;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          notes?: string | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quest_id?: string | null;
          title?: string;
          exercises?: Record<string, unknown>[];
          duration_seconds?: number;
          xp_earned?: number;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          notes?: string | null;
          completed_at?: string;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          requirement_type: string;
          requirement_value: number;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          requirement_type: string;
          requirement_value: number;
          xp_reward: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          requirement_type?: string;
          requirement_value?: number;
          xp_reward?: number;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
        };
        Relationships: [];
      };
      daily_quest_assignments: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          assigned_date: string;
          recovery_level: 'low' | 'medium' | 'high';
          selected: boolean;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_id: string;
          assigned_date: string;
          recovery_level: 'low' | 'medium' | 'high';
          selected?: boolean;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          quest_id?: string;
          assigned_date?: string;
          recovery_level?: 'low' | 'medium' | 'high';
          selected?: boolean;
          completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      weekly_xp: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          xp_earned: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          xp_earned?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          xp_earned?: number;
        };
        Relationships: [];
      };
      user_recovery_scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          source: string;
          scored_date: string;
          raw_data: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          source?: string;
          scored_date?: string;
          raw_data?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          source?: string;
          scored_date?: string;
          raw_data?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard_total_xp: {
        Row: {
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          level: number;
          total_xp: number;
        };
        Relationships: [];
      };
      leaderboard_streaks: {
        Row: {
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          level: number;
          streak_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
      subscription_tier: 'free' | 'pro' | 'elite';
      achievement_rarity: 'common' | 'rare' | 'epic' | 'legendary';
      quest_category: 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'mixed';
      recovery_level: 'low' | 'medium' | 'high';
    };
    CompositeTypes: Record<string, never>;
  };
}

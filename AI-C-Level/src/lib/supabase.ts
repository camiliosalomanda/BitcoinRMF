/**
 * Supabase Client Configuration
 * 
 * This module provides the Supabase client for database operations.
 * 
 * Setup Instructions:
 * 1. Create a free Supabase project at https://supabase.com
 * 2. Go to Project Settings > API
 * 3. Copy the Project URL and anon/public key
 * 4. Add them to your .env.local file:
 *    - NEXT_PUBLIC_SUPABASE_URL=your-project-url
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client (or null if not configured)
// Using 'any' type for flexibility - schema validation happens at DB level
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Helper to check if we can use the database
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.'
    );
  }
  return supabase;
}

// Log configuration status (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (isSupabaseConfigured) {
    console.log('✅ Supabase is configured');
  } else {
    console.log('⚠️ Supabase is not configured - using local storage only');
  }
}

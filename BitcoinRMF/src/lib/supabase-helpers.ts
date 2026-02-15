import { createAdminClient } from '@/lib/supabase';

let _supabaseAvailable: boolean | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here'
  );
}

export async function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) return null;

  // Cache availability check
  if (_supabaseAvailable === false) return null;

  try {
    const client = createAdminClient();
    if (_supabaseAvailable === null) {
      // Quick connectivity check on first call
      const { error } = await client.from('threats').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, which is fine
        if (process.env.NODE_ENV === 'development') {
          console.warn('Supabase not reachable, falling back to seed data:', error.message);
        }
        _supabaseAvailable = false;
        return null;
      }
      _supabaseAvailable = true;
    }
    return client;
  } catch {
    _supabaseAvailable = false;
    return null;
  }
}

export async function writeAuditLog(
  supabase: ReturnType<typeof createAdminClient>,
  entry: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    userName: string;
    diff?: Record<string, unknown>;
  }
) {
  await supabase.from('audit_log').insert({
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    action: entry.action,
    user_id: entry.userId,
    user_name: entry.userName,
    diff: entry.diff,
  });
}

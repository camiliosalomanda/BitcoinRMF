import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser, isAdmin } from '@/lib/admin';
import { scoreUpdateSchema } from '@/lib/validators';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = scoreUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const { field, value } = parsed.data;

  // Only allow updating specific score fields
  const allowedFields: Record<string, string> = {
    necessity_score: 'necessity_score',
    mitigation_effectiveness: 'mitigation_effectiveness',
    community_consensus: 'community_consensus',
    implementation_readiness: 'implementation_readiness',
    adoption_percentage: 'adoption_percentage',
  };

  const dbField = allowedFields[field];
  if (!dbField) {
    return NextResponse.json({ error: `Field '${field}' cannot be updated via score endpoint` }, { status: 400 });
  }

  const { data, error } = await supabase.from('bip_evaluations')
    .update({ [dbField]: value } as Tables['bip_evaluations']['Update'])
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[bips/${id}/score] DB error:`, error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'bip',
    entityId: id,
    action: 'update',
    userId: user!.xId,
    userName: user!.xName,
    diff: { field, value, reason: parsed.data.reason },
  });

  return NextResponse.json(data);
}

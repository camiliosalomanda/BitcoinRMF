import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { vulnerabilityStatus } from '@/lib/validators';
import { vulnerabilityFromRow, type VulnerabilityRow } from '@/lib/transform';
import { writeAuditLog } from '@/lib/supabase-helpers';
import { publishToX, formatVulnerabilityPost } from '@/lib/x-posting';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: vulnerabilityStatus,
});

// Statuses that warrant an X post
const POST_WORTHY_STATUSES = new Set(['CONFIRMED', 'EXPLOITABLE']);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('vulnerabilities')
    .update({ vuln_status: parsed.data.status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'vulnerability',
    entityId: id,
    action: 'update',
    userId: user.xId,
    userName: user.xName,
    diff: { vuln_status: parsed.data.status },
  });

  // Post to X when vulnerability is confirmed or exploitable
  if (POST_WORTHY_STATUSES.has(parsed.data.status)) {
    const row = data as VulnerabilityRow;
    const content = formatVulnerabilityPost({
      name: row.name,
      vulnerability_rating: row.vulnerability_rating,
    });
    await publishToX(supabase, {
      content,
      triggerType: 'vulnerability_status_change',
      entityType: 'vulnerability',
      entityId: id,
    });
  }

  return NextResponse.json(vulnerabilityFromRow(data as VulnerabilityRow));
}

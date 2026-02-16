import { NextResponse } from 'next/server';
import { isAdmin, getSessionUser } from '@/lib/admin';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { fetchBIPIndex, mapGitHubStatus, bipId } from '@/lib/github-bips';
import type { Database } from '@/types/database';

type BIPInsert = Database['public']['Tables']['bip_evaluations']['Insert'];

export async function POST() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const results = { total: 0, inserted: 0, updated: 0, errors: [] as string[] };

  try {
    const githubBIPs = await fetchBIPIndex();
    results.total = githubBIPs.length;

    // Fetch all existing BIP numbers from DB to decide insert vs update
    const { data: existingRows } = await supabase
      .from('bip_evaluations')
      .select('id, bip_number');

    const existingByNumber = new Map<string, string>();
    for (const row of existingRows || []) {
      existingByNumber.set(row.bip_number, row.id);
    }

    for (const bip of githubBIPs) {
      const bipNumber = bip.bipNumber; // e.g. "BIP-0141"
      const existingId = existingByNumber.get(bipNumber);
      const mappedStatus = mapGitHubStatus(bip.status);

      if (existingId) {
        // Update metadata only — never overwrite scoring fields
        const { error } = await supabase
          .from('bip_evaluations')
          .update({
            title: bip.title,
            bip_status: mappedStatus,
            bip_author: bip.author || null,
            bip_type: bip.type || null,
            bip_layer: bip.layer || null,
          })
          .eq('id', existingId);

        if (error) {
          results.errors.push(`Update ${bipNumber}: ${error.message}`);
        } else {
          results.updated++;
        }
      } else {
        // Insert new BIP with metadata only
        const insertRow: BIPInsert = {
          id: bipId(bip.number),
          bip_number: bipNumber,
          title: bip.title,
          bip_status: mappedStatus,
          bip_author: bip.author || null,
          bip_type: bip.type || null,
          bip_layer: bip.layer || null,
          status: 'published',
        };

        const { error } = await supabase
          .from('bip_evaluations')
          .insert(insertRow);

        if (error) {
          results.errors.push(`Insert ${bipNumber}: ${error.message}`);
        } else {
          results.inserted++;
        }
      }
    }

    await writeAuditLog(supabase, {
      entityType: 'bip',
      entityId: 'github-sync',
      action: 'sync',
      userId: user!.xId,
      userName: user!.xName,
      diff: { total: results.total, inserted: results.inserted, updated: results.updated },
    });

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Sync failed: ${message}` },
      { status: 500 }
    );
  }
}

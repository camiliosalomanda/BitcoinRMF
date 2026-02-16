'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useReviewQueue, useAuditLog } from '@/hooks/useAdmin';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSyncBIPs } from '@/hooks/useBIPs';
import Link from 'next/link';
import {
  Shield,
  ClipboardList,
  ScrollText,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { data: pending = [] } = useReviewQueue();
  const { data: auditLog = [] } = useAuditLog(10);
  const { data: stats } = useDashboardStats();

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="h-48 bg-gray-800/30 rounded-xl animate-pulse" />
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <AlertTriangle size={32} className="text-yellow-400 mx-auto mb-3" />
            <p className="text-gray-400">Admin access required</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const syncBIPs = useSyncBIPs();

  const pendingThreats = pending.filter((p) => p.type === 'threat').length;
  const pendingFUD = pending.filter((p) => p.type === 'fud').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Content moderation and platform administration
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/review"
            className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#f7931a]/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList size={18} className="text-[#f7931a]" />
              <span className="text-sm text-gray-400">Community Review</span>
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
            <div className="mt-2 flex gap-3 text-[10px] text-gray-500">
              <span>{pendingThreats} threats</span>
              <span>{pendingFUD} FUD</span>
            </div>
          </Link>

          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={18} className="text-[#f7931a]" />
              <span className="text-sm text-gray-400">Published Content</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalThreats ?? '—'}</p>
            <p className="mt-2 text-[10px] text-gray-500">Total threats tracked</p>
          </div>

          <Link
            href="/admin/audit"
            className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#f7931a]/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <ScrollText size={18} className="text-[#f7931a]" />
              <span className="text-sm text-gray-400">Audit Log</span>
            </div>
            <p className="text-3xl font-bold text-white">{auditLog.length}+</p>
            <p className="mt-2 text-[10px] text-gray-500">Recent actions logged</p>
          </Link>
        </div>

        {/* GitHub BIP Sync */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GitBranch size={18} className="text-[#f7931a]" />
              <div>
                <h2 className="text-sm font-semibold text-white">GitHub BIP Sync</h2>
                <p className="text-[10px] text-gray-500">
                  Pull all BIP metadata from bitcoin/bips repository
                </p>
              </div>
            </div>
            <button
              onClick={() => syncBIPs.mutate()}
              disabled={syncBIPs.isPending}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20 rounded-lg hover:bg-[#f7931a]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncBIPs.isPending ? (
                <>
                  <span className="inline-block w-3 h-3 border border-[#f7931a] border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <GitBranch size={12} />
                  Sync from GitHub
                </>
              )}
            </button>
          </div>
          {syncBIPs.isSuccess && syncBIPs.data && (
            <div className="p-3 rounded-lg bg-green-400/5 border border-green-400/20 text-xs">
              <p className="text-green-400 font-medium mb-1">Sync complete</p>
              <div className="flex gap-4 text-gray-400">
                <span>Total: {syncBIPs.data.total}</span>
                <span>Inserted: {syncBIPs.data.inserted}</span>
                <span>Updated: {syncBIPs.data.updated}</span>
              </div>
              {syncBIPs.data.errors.length > 0 && (
                <p className="text-red-400 mt-1">
                  {syncBIPs.data.errors.length} errors
                </p>
              )}
            </div>
          )}
          {syncBIPs.isError && (
            <div className="p-3 rounded-lg bg-red-400/5 border border-red-400/20 text-xs text-red-400">
              Sync failed: {syncBIPs.error instanceof Error ? syncBIPs.error.message : 'Unknown error'}
            </div>
          )}
        </div>

        {/* Recent Audit Entries */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <Link href="/admin/audit" className="text-xs text-[#f7931a] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {auditLog.length === 0 && (
              <p className="text-xs text-gray-600">No audit entries yet</p>
            )}
            {auditLog.slice(0, 8).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-lg border border-[#2a2a3a]"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    entry.action === 'create' ? 'bg-green-400/10 text-green-400' :
                    entry.action === 'delete' ? 'bg-red-400/10 text-red-400' :
                    entry.action === 'publish' ? 'bg-blue-400/10 text-blue-400' :
                    'bg-gray-400/10 text-gray-400'
                  }`}>
                    {entry.action}
                  </span>
                  <div>
                    <p className="text-sm text-gray-300">
                      {entry.entity_type}/{entry.entity_id}
                    </p>
                    <p className="text-[10px] text-gray-500">by {entry.user_name}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-600">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

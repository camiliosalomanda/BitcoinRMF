'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useReviewQueue, useAuditLog } from '@/hooks/useAdmin';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';
import {
  Shield,
  ClipboardList,
  ScrollText,
  AlertTriangle,
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

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuditLog } from '@/hooks/useAdmin';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ScrollText } from 'lucide-react';

export default function AuditLogPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { data: auditLog = [], isLoading } = useAuditLog(100);
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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

  const filtered = auditLog.filter((entry) => {
    if (actionFilter && entry.action !== actionFilter) return false;
    if (typeFilter && entry.entity_type !== typeFilter) return false;
    return true;
  });

  const actions = [...new Set(auditLog.map((e) => e.action))];
  const types = [...new Set(auditLog.map((e) => e.entity_type))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to Admin
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            Chronological record of all platform changes
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-800/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No audit entries match your filters</p>
          </div>
        ) : (
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] text-left">
                  <th className="px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#2a2a3a]/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        entry.action === 'create' ? 'bg-green-400/10 text-green-400' :
                        entry.action === 'delete' ? 'bg-red-400/10 text-red-400' :
                        entry.action === 'publish' ? 'bg-blue-400/10 text-blue-400' :
                        entry.action === 'archive' ? 'bg-gray-400/10 text-gray-400' :
                        'bg-yellow-400/10 text-yellow-400'
                      }`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">
                      {entry.entity_type}/{entry.entity_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {entry.user_name}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-600 max-w-[200px] truncate">
                      {entry.diff ? JSON.stringify(entry.diff).slice(0, 80) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useMySubmissions } from '@/hooks/useAdmin';
import Link from 'next/link';
import { LogIn, ClipboardList, Plus } from 'lucide-react';

const TYPE_FILTERS = ['', 'threat', 'bip', 'fud'] as const;
const STATUS_FILTERS = ['', 'draft', 'published', 'archived'] as const;

function statusLabel(status: string) {
  if (status === 'draft' || status === 'under_review') return 'Pending';
  if (status === 'published') return 'Published';
  if (status === 'archived') return 'Rejected';
  return status;
}

function statusClasses(status: string) {
  if (status === 'draft' || status === 'under_review') return 'bg-yellow-400/10 text-yellow-400';
  if (status === 'published') return 'bg-green-400/10 text-green-400';
  if (status === 'archived') return 'bg-red-400/10 text-red-400';
  return 'bg-gray-400/10 text-gray-400';
}

function typeClasses(type: string) {
  if (type === 'threat') return 'bg-red-400/10 text-red-400';
  if (type === 'bip') return 'bg-blue-400/10 text-blue-400';
  return 'bg-yellow-400/10 text-yellow-400';
}

function detailHref(type: string, id: string) {
  const base = type === 'threat' ? 'threats' : type === 'bip' ? 'bips' : 'fud';
  return `/${base}/${id}`;
}

export default function SubmissionsPage() {
  const { isAuthenticated, isLoading: roleLoading } = useUserRole();
  const { data: submissions = [], isLoading } = useMySubmissions();
  const [typeFilter, setTypeFilter] = useState<'' | 'threat' | 'bip' | 'fud'>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'draft' | 'published' | 'archived'>('');

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="h-48 bg-gray-800/30 rounded-xl animate-pulse" />
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <LogIn size={32} className="text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">Sign in to view your submissions</p>
            <p className="text-xs text-gray-600">Track your community contributions</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = submissions.filter((item) => {
    if (typeFilter && item.type !== typeFilter) return false;
    if (statusFilter) {
      if (statusFilter === 'draft' && item.status !== 'draft' && item.status !== 'under_review') return false;
      if (statusFilter === 'published' && item.status !== 'published') return false;
      if (statusFilter === 'archived' && item.status !== 'archived') return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your community contributions and review status
          </p>
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === t
                  ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                  : 'text-gray-500 hover:text-gray-300 border border-[#2a2a3a]'
              }`}
            >
              {t === '' ? 'All Types' : t === 'threat' ? 'Threats' : t === 'bip' ? 'BIPs' : 'FUD'}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                  : 'text-gray-500 hover:text-gray-300 border border-[#2a2a3a]'
              }`}
            >
              {s === '' ? 'All Statuses' : s === 'draft' ? 'Pending' : s === 'published' ? 'Published' : 'Rejected'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-800/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          submissions.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-4">You haven&apos;t submitted anything yet</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/threats/submit" className="inline-flex items-center gap-1.5 text-xs text-[#f7931a] hover:text-[#f7931a]/80 px-3 py-1.5 border border-[#f7931a]/20 rounded-lg">
                  <Plus size={12} /> Submit Threat
                </Link>
                <Link href="/bips/submit" className="inline-flex items-center gap-1.5 text-xs text-[#f7931a] hover:text-[#f7931a]/80 px-3 py-1.5 border border-[#f7931a]/20 rounded-lg">
                  <Plus size={12} /> Submit BIP
                </Link>
                <Link href="/fud/submit" className="inline-flex items-center gap-1.5 text-xs text-[#f7931a] hover:text-[#f7931a]/80 px-3 py-1.5 border border-[#f7931a]/20 rounded-lg">
                  <Plus size={12} /> Submit FUD
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600">No submissions match the current filters</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeClasses(item.type)}`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusClasses(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <p className="text-sm text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={detailHref(item.type, item.id)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 border border-[#2a2a3a] rounded-lg"
                  >
                    View
                  </Link>
                </div>

                {item.status === 'archived' && item.rejection_reason && (
                  <div className="mt-3 bg-red-400/5 border border-red-400/10 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-red-400/60 uppercase tracking-wide mb-0.5">Rejection Reason</p>
                    <p className="text-xs text-red-300">{item.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

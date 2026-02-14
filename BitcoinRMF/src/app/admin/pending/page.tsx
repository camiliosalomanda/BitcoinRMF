'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useReviewQueue, usePublishMutation } from '@/hooks/useAdmin';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Check, X, Clock } from 'lucide-react';

export default function PendingPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { data: pending = [], isLoading } = useReviewQueue();
  const publishMutation = usePublishMutation();
  const [typeFilter, setTypeFilter] = useState<'' | 'threat' | 'bip' | 'fud'>('');

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

  const filtered = typeFilter ? pending.filter((p) => p.type === typeFilter) : pending;

  function getApiPath(type: string): 'threats' | 'bips' | 'fud' {
    if (type === 'threat') return 'threats';
    if (type === 'bip') return 'bips';
    return 'fud';
  }

  function handlePublish(type: string, id: string) {
    publishMutation.mutate({ type: getApiPath(type), id, status: 'published' });
  }

  function handleReject(type: string, id: string) {
    publishMutation.mutate({ type: getApiPath(type), id, status: 'archived' });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to Admin
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">Review Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pending.length} items awaiting review
          </p>
        </div>

        <div className="flex gap-2">
          {(['', 'threat', 'bip', 'fud'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === t
                  ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                  : 'text-gray-500 hover:text-gray-300 border border-[#2a2a3a]'
              }`}
            >
              {t === '' ? 'All' : t === 'threat' ? 'Threats' : t === 'bip' ? 'BIPs' : 'FUD'}
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
          <div className="text-center py-12">
            <Clock size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No items pending review</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      item.type === 'threat' ? 'bg-red-400/10 text-red-400' :
                      item.type === 'bip' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      item.status === 'draft' ? 'bg-gray-400/10 text-gray-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Submitted by {item.submitted_by_name || 'Unknown'} &middot; {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${item.type === 'threat' ? 'threats' : item.type === 'bip' ? 'bips' : 'fud'}/${item.id}`}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 border border-[#2a2a3a] rounded-lg"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handlePublish(item.type, item.id)}
                    disabled={publishMutation.isPending}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 px-2 py-1 border border-green-400/20 rounded-lg hover:bg-green-400/5 disabled:opacity-50"
                  >
                    <Check size={12} />
                    Publish
                  </button>
                  <button
                    onClick={() => handleReject(item.type, item.id)}
                    disabled={publishMutation.isPending}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-400/20 rounded-lg hover:bg-red-400/5 disabled:opacity-50"
                  >
                    <X size={12} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

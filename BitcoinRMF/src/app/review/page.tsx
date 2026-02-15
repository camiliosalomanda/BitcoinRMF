'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import VotePanel from '@/components/votes/VotePanel';
import { useUserRole } from '@/hooks/useUserRole';
import { useCommunityReviewQueue } from '@/hooks/useAdmin';
import Link from 'next/link';
import { LogIn, Vote, Clock } from 'lucide-react';

export default function ReviewPage() {
  const { isAuthenticated, isLoading: roleLoading } = useUserRole();
  const { data: items = [], isLoading } = useCommunityReviewQueue();
  const [typeFilter, setTypeFilter] = useState<'' | 'threat' | 'fud'>('');

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
            <p className="text-gray-400 mb-1">Sign in to review submissions</p>
            <p className="text-xs text-gray-600">Community consensus determines what gets published</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = typeFilter ? items.filter((i) => i.type === typeFilter) : items;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Vote size={24} className="text-[#f7931a]" />
            <h1 className="text-2xl font-bold text-white">Community Review</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Vote to approve or reject community submissions. Items reaching +3 net votes are published, −3 are archived.
          </p>
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {(['' , 'threat', 'fud'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === t
                  ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                  : 'text-gray-500 hover:text-gray-300 border border-[#2a2a3a]'
              }`}
            >
              {t === '' ? 'All' : t === 'threat' ? 'Threats' : 'FUD'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No submissions awaiting community review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        item.type === 'threat' ? 'bg-red-400/10 text-red-400' : 'bg-yellow-400/10 text-yellow-400'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400">
                        {item.status === 'under_review' ? 'Under Review' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Submitted by {item.submitted_by_name || 'Unknown'} &middot; {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/${item.type === 'threat' ? 'threats' : 'fud'}/${item.id}`}
                    className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-[#2a2a3a] rounded-lg flex-shrink-0"
                  >
                    View
                  </Link>
                </div>

                <VotePanel
                  targetType={item.type}
                  targetId={item.id}
                  submittedBy={item.submitted_by || undefined}
                  itemStatus={item.status}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import BIPCard from '@/components/bips/BIPCard';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useBIPs } from '@/hooks/useBIPs';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import type { BIPEvaluation } from '@/types';

type EvalFilter = 'all' | 'evaluated' | 'unevaluated';
type StatusFilter = '' | BIPEvaluation['status'];

export default function BIPsPage() {
  const { data: bips = [], isLoading } = useBIPs();
  const { isAuthenticated } = useUserRole();
  const [search, setSearch] = useState('');
  const [evalFilter, setEvalFilter] = useState<EvalFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const evaluatedCount = useMemo(() => bips.filter((b) => b.aiEvaluated).length, [bips]);

  const filteredBips = useMemo(() => {
    let result = [...bips];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bipNumber.toLowerCase().includes(q) ||
          b.title.toLowerCase().includes(q) ||
          (b.bipAuthor && b.bipAuthor.toLowerCase().includes(q))
      );
    }

    // Evaluation filter
    if (evalFilter === 'evaluated') {
      result = result.filter((b) => b.aiEvaluated);
    } else if (evalFilter === 'unevaluated') {
      result = result.filter((b) => !b.aiEvaluated);
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Sort: evaluated first (by necessity score desc), then unevaluated alphabetically
    result.sort((a, b) => {
      if (a.aiEvaluated && !b.aiEvaluated) return -1;
      if (!a.aiEvaluated && b.aiEvaluated) return 1;
      if (a.aiEvaluated && b.aiEvaluated) return b.necessityScore - a.necessityScore;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [bips, search, evalFilter, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">BIP Evaluator</h1>
            <p className="text-gray-500 text-sm mt-1">
              Bitcoin Improvement Proposal necessity scoring against the current threat landscape
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/bips/submit"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20 rounded-lg hover:bg-[#f7931a]/20 transition-colors"
            >
              <Plus size={12} />
              Submit New
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search BIPs by number, title, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#111118] border border-[#2a2a3a] rounded-lg text-white placeholder-gray-600 focus:border-[#f7931a]/30 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs bg-[#111118] border border-[#2a2a3a] rounded-lg text-gray-300 px-3 py-2 focus:border-[#f7931a]/30 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PROPOSED">Proposed</option>
            <option value="ACTIVE">Active</option>
            <option value="FINAL">Final</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="REPLACED">Replaced</option>
          </select>
          <div className="flex rounded-lg border border-[#2a2a3a] overflow-hidden">
            {(['all', 'evaluated', 'unevaluated'] as const).map((val) => (
              <button
                key={val}
                onClick={() => setEvalFilter(val)}
                className={`text-xs px-3 py-2 transition-colors ${
                  evalFilter === val
                    ? 'bg-[#f7931a]/10 text-[#f7931a]'
                    : 'bg-[#111118] text-gray-500 hover:text-gray-300'
                }`}
              >
                {val === 'all' ? 'All' : val === 'evaluated' ? 'AI Evaluated' : 'Unevaluated'}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!isLoading && bips.length > 0 && (
          <p className="text-xs text-gray-500">
            {filteredBips.length} of {bips.length} BIPs ({evaluatedCount} AI-evaluated)
          </p>
        )}

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBips.map((bip) => (
              <BIPCard key={bip.id} bip={bip} />
            ))}
          </div>
        )}

        {!isLoading && bips.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No BIP evaluations yet</p>
          </div>
        )}

        {!isLoading && bips.length > 0 && filteredBips.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No BIPs match your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

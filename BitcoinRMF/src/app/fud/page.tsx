'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import FUDCard from '@/components/fud/FUDCard';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useFUD } from '@/hooks/useFUD';
import { useUserRole } from '@/hooks/useUserRole';
import { FUDCategory, FUDStatus } from '@/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function FUDPage() {
  const { data: fudAnalyses = [], isLoading } = useFUD();
  const { isAuthenticated } = useUserRole();
  const [categoryFilter, setCategoryFilter] = useState<FUDCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<FUDStatus | ''>('');

  const filtered = fudAnalyses.filter((f) => {
    if (categoryFilter && f.category !== categoryFilter) return false;
    if (statusFilter && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">FUD Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tracking and debunking fear, uncertainty, and doubt narratives with evidence-based analysis
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/fud/submit"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20 rounded-lg hover:bg-[#f7931a]/20 transition-colors"
            >
              <Plus size={12} />
              Submit New
            </Link>
          )}
        </div>

        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as FUDCategory | '')}
            className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Categories</option>
            {Object.values(FUDCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FUDStatus | '')}
            className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DEBUNKED">Debunked</option>
            <option value="PARTIALLY_VALID">Partially Valid</option>
          </select>
        </div>

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((fud) => (
              <FUDCard key={fud.id} fud={fud} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No FUD narratives match your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

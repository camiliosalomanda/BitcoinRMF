'use client';

import DashboardLayout from '@/components/DashboardLayout';
import BIPCard from '@/components/bips/BIPCard';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useBIPs } from '@/hooks/useBIPs';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function BIPsPage() {
  const { data: bips = [], isLoading } = useBIPs();
  const { isAuthenticated } = useUserRole();

  const sortedBips = [...bips].sort((a, b) => b.necessityScore - a.necessityScore);

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

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedBips.map((bip) => (
              <BIPCard key={bip.id} bip={bip} />
            ))}
          </div>
        )}

        {!isLoading && bips.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No BIP evaluations yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

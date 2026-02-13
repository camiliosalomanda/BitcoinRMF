'use client';

import DashboardLayout from '@/components/DashboardLayout';
import BIPCard from '@/components/bips/BIPCard';
import { useRMFStore } from '@/lib/store';

export default function BIPsPage() {
  const { bips } = useRMFStore();

  const sortedBips = [...bips].sort((a, b) => b.necessityScore - a.necessityScore);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">BIP Evaluator</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bitcoin Improvement Proposal necessity scoring against the current threat landscape
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedBips.map((bip) => (
            <BIPCard key={bip.id} bip={bip} />
          ))}
        </div>

        {bips.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No BIP evaluations yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

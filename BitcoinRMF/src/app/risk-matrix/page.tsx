'use client';

import DashboardLayout from '@/components/DashboardLayout';
import RiskHeatmap from '@/components/risk-matrix/RiskHeatmap';
import { useRMFStore } from '@/lib/store';

export default function RiskMatrixPage() {
  const { getRiskMatrix } = useRMFStore();

  const matrix = getRiskMatrix();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Matrix</h1>
          <p className="text-gray-500 text-sm mt-1">
            5&times;5 heatmap of Bitcoin threat landscape — Likelihood vs Impact
          </p>
        </div>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <RiskHeatmap matrix={matrix} />
        </div>
      </div>
    </DashboardLayout>
  );
}

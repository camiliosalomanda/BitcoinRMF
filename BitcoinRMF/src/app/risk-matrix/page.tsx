'use client';

import DashboardLayout from '@/components/DashboardLayout';
import RiskHeatmap from '@/components/risk-matrix/RiskHeatmap';
import ShareToXButton from '@/components/ShareToXButton';
import { useRiskMatrix } from '@/hooks/useRiskMatrix';

export default function RiskMatrixPage() {
  const { data: matrix, isLoading } = useRiskMatrix();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Risk Matrix</h1>
            <p className="text-gray-500 text-sm mt-1">
              5&times;5 heatmap of Bitcoin threat landscape — Likelihood vs Impact
            </p>
          </div>
          <ShareToXButton
            text="Bitcoin Risk Matrix \u2014 5\u00d75 heatmap of the threat landscape mapped by Likelihood vs Impact"
            hashtags={['Bitcoin', 'RiskManagement', 'BitcoinRMF']}
          />
        </div>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          {isLoading || !matrix ? (
            <div className="h-96 bg-gray-800/30 rounded animate-pulse" />
          ) : (
            <RiskHeatmap matrix={matrix} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

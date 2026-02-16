'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import RiskDetail from '@/components/risks/RiskDetail';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { useRisk } from '@/hooks/useRisks';

export default function RiskDetailPageClient() {
  const params = useParams();
  const threatId = params.threatId as string;
  const vulnId = params.vulnId as string;
  const { data: risk, isLoading } = useRisk(threatId, vulnId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <DetailSkeleton />
      </DashboardLayout>
    );
  }

  if (!risk) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-lg text-gray-400">Risk not found</p>
            <p className="text-sm text-gray-600 mt-1">
              Threat: {threatId} / Vulnerability: {vulnId}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <RiskDetail risk={risk} />
    </DashboardLayout>
  );
}

'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ThreatDetail from '@/components/threats/ThreatDetail';
import VotePanel from '@/components/votes/VotePanel';
import CommentSection from '@/components/comments/CommentSection';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { useThreat } from '@/hooks/useThreats';

export default function ThreatDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: threat, isLoading } = useThreat(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <DetailSkeleton />
      </DashboardLayout>
    );
  }

  if (!threat) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-lg text-gray-400">Threat not found</p>
            <p className="text-sm text-gray-600 mt-1">ID: {id}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ThreatDetail threat={threat} />
      <div className="mt-6">
        <VotePanel targetType="threat" targetId={id} submittedBy={threat.submittedBy} itemStatus={threat.status} />
      </div>
      <div className="mt-6">
        <CommentSection targetType="threat" targetId={id} />
      </div>
    </DashboardLayout>
  );
}

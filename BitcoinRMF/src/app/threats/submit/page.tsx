'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ThreatForm from '@/components/forms/ThreatForm';
import { useCreateThreat } from '@/hooks/useThreats';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { ArrowLeft, LogIn } from 'lucide-react';

export default function SubmitThreatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserRole();
  const createThreat = useCreateThreat();

  if (isLoading) {
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
            <p className="text-gray-400 mb-1">Sign in to submit threats</p>
            <p className="text-xs text-gray-600">Community submissions require authentication</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/threats" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to Threat Register
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">Submit a Threat</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submissions are saved as drafts and reviewed by admins before publishing.
          </p>
        </div>

        {createThreat.isSuccess && (
          <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
            <p className="text-sm text-green-400">Threat submitted successfully! It will appear after admin review.</p>
          </div>
        )}

        {createThreat.isError && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4">
            <p className="text-sm text-red-400">Failed to submit. Please try again.</p>
          </div>
        )}

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <ThreatForm
            onSubmit={(data) => {
              createThreat.mutate(data, {
                onSuccess: () => {
                  setTimeout(() => router.push('/threats'), 1500);
                },
              });
            }}
            isPending={createThreat.isPending}
            submitLabel="Submit Threat for Review"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

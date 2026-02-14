'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import FUDForm from '@/components/forms/FUDForm';
import { useCreateFUD } from '@/hooks/useFUD';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { ArrowLeft, LogIn } from 'lucide-react';

export default function SubmitFUDPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserRole();
  const createFUD = useCreateFUD();

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
            <p className="text-gray-400 mb-1">Sign in to submit FUD analyses</p>
            <p className="text-xs text-gray-600">Community submissions require authentication</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/fud" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to FUD Tracker
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">Submit FUD Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submissions are saved as drafts and reviewed by admins before publishing.
          </p>
        </div>

        {createFUD.isSuccess && (
          <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
            <p className="text-sm text-green-400">FUD analysis submitted! It will appear after admin review.</p>
          </div>
        )}

        {createFUD.isError && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4">
            <p className="text-sm text-red-400">Failed to submit. Please try again.</p>
          </div>
        )}

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <FUDForm
            onSubmit={(data) => {
              createFUD.mutate(data, {
                onSuccess: () => {
                  setTimeout(() => router.push('/fud'), 1500);
                },
              });
            }}
            isPending={createFUD.isPending}
            submitLabel="Submit FUD Analysis for Review"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

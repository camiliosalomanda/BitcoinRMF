'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft, FileCode, ExternalLink } from 'lucide-react';

export default function SubmitBIPPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/bips" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to BIP Evaluator
        </Link>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-8 text-center">
          <FileCode size={40} className="text-[#f7931a] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">BIP Submissions Not Accepted</h1>
          <p className="text-sm text-gray-400 mb-6">
            Bitcoin Improvement Proposals (BIPs) come from the Bitcoin network&apos;s own process.
            They are not community-submitted here &mdash; instead, use the BIP Evaluator to analyze
            existing proposals from the official BIP repository.
          </p>
          <Link
            href="/bips"
            className="inline-flex items-center gap-2 text-sm text-[#f7931a] hover:text-[#f7931a]/80 px-4 py-2 border border-[#f7931a]/20 rounded-lg transition-colors"
          >
            <ExternalLink size={14} />
            Go to BIP Evaluator
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

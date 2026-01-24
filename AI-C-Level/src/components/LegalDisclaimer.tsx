'use client';

/**
 * Legal Disclaimer Component
 * Displays appropriate disclaimers based on executive type
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ExecutiveRole } from '@/types/executives';

interface LegalDisclaimerProps {
  executive?: ExecutiveRole | 'group';
  compact?: boolean;
  dismissible?: boolean;
}

const EXECUTIVE_DISCLAIMERS: Record<ExecutiveRole | 'group', { title: string; warning: string }> = {
  CFO: {
    title: 'Financial Information Disclaimer',
    warning: 'AI-generated content is for informational purposes only and does not constitute financial, investment, or tax advice. The AI "CFO" is not a licensed CPA, financial advisor, or securities professional. Consult qualified professionals before making financial decisions.',
  },
  CMO: {
    title: 'Marketing Information Disclaimer',
    warning: 'AI-generated marketing suggestions are for informational purposes only. Results may vary. Verify all claims and ensure compliance with advertising regulations (FTC, CAN-SPAM, etc.) before implementation.',
  },
  COO: {
    title: 'Operations Information Disclaimer',
    warning: 'AI-generated operational recommendations are for informational purposes only. Implementation should be reviewed by qualified professionals familiar with your specific business context and regulatory requirements.',
  },
  CHRO: {
    title: 'HR Information Disclaimer',
    warning: 'AI-generated HR guidance is for informational purposes only and does not constitute employment law advice. The AI "CHRO" is not an employment attorney. Consult HR professionals and legal counsel for employment matters.',
  },
  CTO: {
    title: 'Technology Information Disclaimer',
    warning: 'AI-generated technical recommendations are for informational purposes only. Code and architecture suggestions should be reviewed by qualified engineers. Security recommendations do not constitute a security audit.',
  },
  CCO: {
    title: 'Compliance Information Disclaimer',
    warning: 'AI-generated compliance information is for educational purposes only and does not constitute legal advice or compliance certification. The AI "CCO" is not a licensed attorney. Consult legal counsel for compliance matters.',
  },
  group: {
    title: 'AI Advisory Disclaimer',
    warning: 'AI-generated content from all executives is for informational and educational purposes only. These are simulated personas, not licensed professionals. Consult qualified experts before making business decisions.',
  },
};

export default function LegalDisclaimer({ 
  executive = 'group', 
  compact = false,
  dismissible = true 
}: LegalDisclaimerProps) {
  const [dismissed, setDismissed] = useState(false);
  const disclaimer = EXECUTIVE_DISCLAIMERS[executive];

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 text-xs">
        <p className="text-amber-800">
          <strong>⚠️ Not Professional Advice:</strong> AI-generated content is for informational purposes only.{' '}
          <Link href="/ai-disclosure" className="underline hover:text-amber-900">Learn more</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-amber-500 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-amber-800 text-sm">{disclaimer.title}</h4>
            <p className="text-amber-700 text-xs mt-1">{disclaimer.warning}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <Link href="/terms" className="text-amber-600 hover:text-amber-800 underline">
                Terms of Service
              </Link>
              <Link href="/ai-disclosure" className="text-amber-600 hover:text-amber-800 underline">
                AI Disclosure
              </Link>
            </div>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 p-1"
            aria-label="Dismiss disclaimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline disclaimer for chat messages
 */
export function InlineDisclaimer() {
  return (
    <p className="text-[10px] text-gray-400 mt-2 italic">
      AI-generated • Not professional advice • <Link href="/ai-disclosure" className="underline">Disclaimer</Link>
    </p>
  );
}

/**
 * Footer disclaimer for pages
 */
export function FooterDisclaimer() {
  return (
    <div className="text-center text-xs text-gray-500 py-4 border-t mt-8">
      <p>
        BizAI provides AI-generated information for educational purposes only.{' '}
        <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>
        {' • '}
        <Link href="/privacy" className="text-blue-600 hover:underline">Privacy</Link>
        {' • '}
        <Link href="/ai-disclosure" className="text-blue-600 hover:underline">AI Disclosure</Link>
      </p>
      <p className="mt-1">
        © {new Date().getFullYear()} BizAI. Not a substitute for professional advice.
      </p>
    </div>
  );
}

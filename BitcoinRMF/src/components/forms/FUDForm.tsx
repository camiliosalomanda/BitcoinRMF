'use client';

import { useState } from 'react';
import { FUDCategory } from '@/types';
import type { FUDInput } from '@/lib/validators';
import { Plus, Twitter } from 'lucide-react';

const X_URL_PATTERN = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;

interface FUDFormProps {
  initialData?: Partial<FUDInput>;
  onSubmit: (data: FUDInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

const CATEGORY_OPTIONS = Object.values(FUDCategory);

export default function FUDForm({ initialData, onSubmit, isPending, submitLabel = 'Submit' }: FUDFormProps) {
  const [narrative, setNarrative] = useState(initialData?.narrative || '');
  const [category, setCategory] = useState<string>(initialData?.category || '');
  const [validityScore, setValidityScore] = useState(initialData?.validityScore ?? 20);
  const [evidenceFor, setEvidenceFor] = useState(initialData?.evidenceFor?.join('\n') || '');
  const [evidenceAgainst, setEvidenceAgainst] = useState(initialData?.evidenceAgainst?.join('\n') || '');
  const [debunkSummary, setDebunkSummary] = useState(initialData?.debunkSummary || '');
  const [priceImpactEstimate, setPriceImpactEstimate] = useState(initialData?.priceImpactEstimate || '');
  const [xPostUrl, setXPostUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addXPost(target: 'for' | 'against') {
    if (!xPostUrl.trim() || !X_URL_PATTERN.test(xPostUrl.trim())) return;
    const url = xPostUrl.trim();
    if (target === 'for') {
      setEvidenceFor((prev) => prev ? `${prev}\n${url}` : url);
    } else {
      setEvidenceAgainst((prev) => prev ? `${prev}\n${url}` : url);
    }
    setXPostUrl('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!narrative.trim()) errs.narrative = 'Narrative claim is required';
    if (!category) errs.category = 'Category is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const forLines = evidenceFor.split('\n').map((l) => l.trim()).filter(Boolean);
    const againstLines = evidenceAgainst.split('\n').map((l) => l.trim()).filter(Boolean);

    onSubmit({
      narrative: narrative.trim(),
      category: category as FUDInput['category'],
      validityScore,
      evidenceFor: forLines.length > 0 ? forLines : undefined,
      evidenceAgainst: againstLines.length > 0 ? againstLines : undefined,
      debunkSummary: debunkSummary.trim() || undefined,
      priceImpactEstimate: priceImpactEstimate.trim() || undefined,
    });
  }

  const inputClass = 'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50';
  const labelClass = 'block text-sm font-medium text-gray-400 mb-1';
  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>FUD Narrative / Claim *</label>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder='e.g., "Bitcoin will be banned by all governments"'
        />
        {errors.narrative && <p className={errorClass}>{errors.narrative}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category}</p>}
        </div>

        <div>
          <label className={labelClass}>Validity Score: {validityScore}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={validityScore}
            onChange={(e) => setValidityScore(Number(e.target.value))}
            className="w-full accent-[#f7931a]"
          />
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Total FUD</span><span>Completely Valid</span>
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Evidence Supporting the Claim (one per line)</label>
        <textarea
          value={evidenceFor}
          onChange={(e) => setEvidenceFor(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Enter each supporting point on a new line..."
        />
      </div>

      <div>
        <label className={labelClass}>Evidence Against the Claim (one per line)</label>
        <textarea
          value={evidenceAgainst}
          onChange={(e) => setEvidenceAgainst(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Enter each counter-point on a new line..."
        />
      </div>

      {/* Add X Post as Evidence */}
      <div>
        <label className={labelClass}>
          <Twitter size={12} className="inline mr-1 text-sky-400" />
          Add X Post as Evidence
        </label>
        <div className="flex gap-2">
          <input
            value={xPostUrl}
            onChange={(e) => setXPostUrl(e.target.value)}
            className={`${inputClass} flex-1`}
            placeholder="https://x.com/user/status/123456..."
          />
          <button
            type="button"
            onClick={() => addXPost('for')}
            disabled={!xPostUrl.trim() || !X_URL_PATTERN.test(xPostUrl.trim())}
            className="px-3 py-2 bg-red-400/10 text-red-400 text-xs rounded-lg hover:bg-red-400/20 transition-colors disabled:opacity-30 whitespace-nowrap"
          >
            <Plus size={12} className="inline mr-1" />
            For
          </button>
          <button
            type="button"
            onClick={() => addXPost('against')}
            disabled={!xPostUrl.trim() || !X_URL_PATTERN.test(xPostUrl.trim())}
            className="px-3 py-2 bg-green-400/10 text-green-400 text-xs rounded-lg hover:bg-green-400/20 transition-colors disabled:opacity-30 whitespace-nowrap"
          >
            <Plus size={12} className="inline mr-1" />
            Against
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1">
          Paste an X/Twitter URL and add it as supporting or debunking evidence. Shows as live embed on detail page.
        </p>
      </div>

      <div>
        <label className={labelClass}>Debunk Summary</label>
        <textarea
          value={debunkSummary}
          onChange={(e) => setDebunkSummary(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="A concise summary of why this narrative is FUD..."
        />
      </div>

      <div>
        <label className={labelClass}>Price Impact Estimate</label>
        <input
          value={priceImpactEstimate}
          onChange={(e) => setPriceImpactEstimate(e.target.value)}
          className={inputClass}
          placeholder='e.g., "Short-term -5% to -15% during regulatory announcements"'
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {isPending ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
}

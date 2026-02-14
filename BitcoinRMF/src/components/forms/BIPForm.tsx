'use client';

import { useState } from 'react';
import { BIPRecommendation } from '@/types';
import type { BIPInput } from '@/lib/validators';

interface BIPFormProps {
  initialData?: Partial<BIPInput>;
  onSubmit: (data: BIPInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

const RECOMMENDATION_OPTIONS = Object.values(BIPRecommendation);

export default function BIPForm({ initialData, onSubmit, isPending, submitLabel = 'Submit' }: BIPFormProps) {
  const [bipNumber, setBipNumber] = useState(initialData?.bipNumber || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [recommendation, setRecommendation] = useState<string>(initialData?.recommendation || '');
  const [necessityScore, setNecessityScore] = useState(initialData?.necessityScore ?? 50);
  const [mitigationEffectiveness, setMitigationEffectiveness] = useState(initialData?.mitigationEffectiveness ?? 50);
  const [communityConsensus, setCommunityConsensus] = useState(initialData?.communityConsensus ?? 50);
  const [implementationReadiness, setImplementationReadiness] = useState(initialData?.implementationReadiness ?? 50);
  const [economicImpact, setEconomicImpact] = useState(initialData?.economicImpact || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!bipNumber.trim()) errs.bipNumber = 'BIP number is required';
    if (!title.trim()) errs.title = 'Title is required';
    if (!recommendation) errs.recommendation = 'Recommendation is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSubmit({
      bipNumber: bipNumber.trim(),
      title: title.trim(),
      summary: summary.trim() || undefined,
      recommendation: recommendation as BIPInput['recommendation'],
      necessityScore,
      mitigationEffectiveness,
      communityConsensus,
      implementationReadiness,
      economicImpact: economicImpact.trim() || undefined,
    });
  }

  const inputClass = 'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50';
  const labelClass = 'block text-sm font-medium text-gray-400 mb-1';
  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>BIP Number *</label>
          <input
            value={bipNumber}
            onChange={(e) => setBipNumber(e.target.value)}
            className={inputClass}
            placeholder="e.g., 340"
          />
          {errors.bipNumber && <p className={errorClass}>{errors.bipNumber}</p>}
        </div>

        <div>
          <label className={labelClass}>Recommendation *</label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            {RECOMMENDATION_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.recommendation && <p className={errorClass}>{errors.recommendation}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g., Schnorr Signatures for secp256k1"
        />
        {errors.title && <p className={errorClass}>{errors.title}</p>}
      </div>

      <div>
        <label className={labelClass}>Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Describe the BIP, its purpose, and how it affects Bitcoin's security posture..."
        />
      </div>

      <div>
        <label className={labelClass}>Necessity Score: {necessityScore}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={necessityScore}
          onChange={(e) => setNecessityScore(Number(e.target.value))}
          className="w-full accent-[#f7931a]"
        />
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>Unnecessary</span><span>Critical</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Mitigation Effectiveness: {mitigationEffectiveness}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={mitigationEffectiveness}
            onChange={(e) => setMitigationEffectiveness(Number(e.target.value))}
            className="w-full accent-[#f7931a]"
          />
        </div>

        <div>
          <label className={labelClass}>Community Consensus: {communityConsensus}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={communityConsensus}
            onChange={(e) => setCommunityConsensus(Number(e.target.value))}
            className="w-full accent-[#f7931a]"
          />
        </div>

        <div>
          <label className={labelClass}>Implementation Readiness: {implementationReadiness}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={implementationReadiness}
            onChange={(e) => setImplementationReadiness(Number(e.target.value))}
            className="w-full accent-[#f7931a]"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Economic Impact</label>
        <textarea
          value={economicImpact}
          onChange={(e) => setEconomicImpact(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="What economic effects would this BIP have on the Bitcoin ecosystem?"
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

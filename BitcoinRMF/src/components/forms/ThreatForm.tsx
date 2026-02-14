'use client';

import { useState } from 'react';
import { STRIDECategory, ThreatSource, AffectedComponent } from '@/types';
import type { ThreatInput } from '@/lib/validators';

interface ThreatFormProps {
  initialData?: Partial<ThreatInput>;
  onSubmit: (data: ThreatInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

const STRIDE_OPTIONS = Object.values(STRIDECategory);
const SOURCE_OPTIONS = Object.values(ThreatSource);
const COMPONENT_OPTIONS = Object.values(AffectedComponent);

export default function ThreatForm({ initialData, onSubmit, isPending, submitLabel = 'Submit' }: ThreatFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [strideCategory, setStrideCategory] = useState<string>(initialData?.strideCategory || '');
  const [threatSource, setThreatSource] = useState<string>(initialData?.threatSource || '');
  const [affectedComponents, setAffectedComponents] = useState<string[]>(
    initialData?.affectedComponents || []
  );
  const [likelihood, setLikelihood] = useState(initialData?.likelihood || 3);
  const [impact, setImpact] = useState(initialData?.impact || 3);
  const [vulnerability, setVulnerability] = useState(initialData?.vulnerability || '');
  const [exploitScenario, setExploitScenario] = useState(initialData?.exploitScenario || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleComponent(comp: string) {
    setAffectedComponents((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!strideCategory) errs.strideCategory = 'STRIDE category is required';
    if (!threatSource) errs.threatSource = 'Threat source is required';
    if (affectedComponents.length === 0) errs.affectedComponents = 'Select at least one component';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      strideCategory: strideCategory as ThreatInput['strideCategory'],
      threatSource: threatSource as ThreatInput['threatSource'],
      affectedComponents: affectedComponents as ThreatInput['affectedComponents'],
      likelihood: likelihood as ThreatInput['likelihood'],
      impact: impact as ThreatInput['impact'],
      vulnerability: vulnerability.trim() || undefined,
      exploitScenario: exploitScenario.trim() || undefined,
    });
  }

  const inputClass = 'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50';
  const labelClass = 'block text-sm font-medium text-gray-400 mb-1';
  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Threat Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g., 51% Attack on Bitcoin Network"
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Describe the threat, its mechanisms, and potential impact..."
        />
        {errors.description && <p className={errorClass}>{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>STRIDE Category *</label>
          <select
            value={strideCategory}
            onChange={(e) => setStrideCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            {STRIDE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {errors.strideCategory && <p className={errorClass}>{errors.strideCategory}</p>}
        </div>

        <div>
          <label className={labelClass}>Threat Source *</label>
          <select
            value={threatSource}
            onChange={(e) => setThreatSource(e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {errors.threatSource && <p className={errorClass}>{errors.threatSource}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Affected Components *</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {COMPONENT_OPTIONS.map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => toggleComponent(comp)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                affectedComponents.includes(comp)
                  ? 'bg-[#f7931a]/10 text-[#f7931a] border-[#f7931a]/30'
                  : 'text-gray-500 border-[#2a2a3a] hover:text-gray-300'
              }`}
            >
              {comp.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        {errors.affectedComponents && <p className={errorClass}>{errors.affectedComponents}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Likelihood (1-5): {likelihood}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={likelihood}
            onChange={(e) => setLikelihood(Number(e.target.value))}
            className="w-full accent-[#f7931a]"
          />
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Rare</span><span>Almost Certain</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Impact (1-5): {impact}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={impact}
            onChange={(e) => setImpact(Number(e.target.value))}
            className="w-full accent-[#f7931a]"
          />
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Negligible</span><span>Catastrophic</span>
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Vulnerability (optional)</label>
        <textarea
          value={vulnerability}
          onChange={(e) => setVulnerability(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="What underlying weakness does this threat exploit?"
        />
      </div>

      <div>
        <label className={labelClass}>Exploit Scenario (optional)</label>
        <textarea
          value={exploitScenario}
          onChange={(e) => setExploitScenario(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Step-by-step scenario of how this threat could be exploited..."
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

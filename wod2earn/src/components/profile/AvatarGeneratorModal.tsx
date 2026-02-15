'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UserProfile, BodyMeasurements, Appearance } from '@/types';

interface AvatarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const MEASUREMENT_FIELDS = [
  { key: 'chest_cm', label: 'Chest (cm)', placeholder: '95' },
  { key: 'waist_cm', label: 'Waist (cm)', placeholder: '80' },
  { key: 'hips_cm', label: 'Hips (cm)', placeholder: '95' },
  { key: 'shoulders_cm', label: 'Shoulders (cm)', placeholder: '115' },
  { key: 'arm_cm', label: 'Arms (cm)', placeholder: '35' },
  { key: 'thigh_cm', label: 'Thighs (cm)', placeholder: '55' },
] as const;

const APPEARANCE_OPTIONS = {
  hair_color: { label: 'Hair Color', values: ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray/White', 'Other'] },
  eye_color: { label: 'Eye Color', values: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'] },
  hair_length: { label: 'Hair Length', values: ['Bald/Shaved', 'Short', 'Medium', 'Long'] },
  facial_hair: { label: 'Facial Hair', values: ['None', 'Stubble', 'Goatee', 'Full Beard', 'Mustache'] },
} as const;

type AppearanceKey = keyof typeof APPEARANCE_OPTIONS;

function formatGoal(g: string): string {
  const map: Record<string, string> = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    maintain: 'Maintain',
    endurance: 'Endurance',
  };
  return map[g] ?? g;
}

export function AvatarGeneratorModal({ isOpen, onClose, user, onSave }: AvatarGeneratorModalProps) {
  const existing = user.body_measurements;
  const existingAppearance = user.appearance;
  const [measurements, setMeasurements] = useState<Record<string, string>>({
    chest_cm: existing?.chest_cm?.toString() ?? '',
    waist_cm: existing?.waist_cm?.toString() ?? '',
    hips_cm: existing?.hips_cm?.toString() ?? '',
    shoulders_cm: existing?.shoulders_cm?.toString() ?? '',
    arm_cm: existing?.arm_cm?.toString() ?? '',
    thigh_cm: existing?.thigh_cm?.toString() ?? '',
  });
  const [appearance, setAppearance] = useState<Record<string, string>>({
    hair_color: existingAppearance?.hair_color ?? '',
    eye_color: existingAppearance?.eye_color ?? '',
    hair_length: existingAppearance?.hair_length ?? '',
    facial_hair: existingAppearance?.facial_hair ?? '',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  function updateMeasurement(key: string, value: string) {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');

    try {
      // Build measurements object — only include non-empty values
      const body: BodyMeasurements = {};
      for (const { key } of MEASUREMENT_FIELDS) {
        const val = measurements[key];
        if (val) {
          const num = Number(val);
          if (!isNaN(num) && num >= 10 && num <= 300) {
            (body as Record<string, number>)[key] = num;
          }
        }
      }

      // Build appearance object — only include non-empty values
      const appearanceData: Partial<Appearance> = {};
      for (const key of Object.keys(APPEARANCE_OPTIONS) as AppearanceKey[]) {
        const val = appearance[key];
        if (val) {
          (appearanceData as Record<string, string>)[key] = val;
        }
      }

      const res = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurements: Object.keys(body).length > 0 ? body : undefined,
          appearance: Object.keys(appearanceData).length > 0 ? appearanceData : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate avatar');
        return;
      }

      setGeneratedUrl(data.avatar_url);
      onSave(data.user as UserProfile);
    } catch {
      setError('Network error — please try again');
    } finally {
      setGenerating(false);
    }
  }

  // Profile attributes summary
  const attrs: string[] = [];
  if (user.gender) attrs.push(user.gender === 'non_binary' ? 'Non-binary' : user.gender.charAt(0).toUpperCase() + user.gender.slice(1));
  if (user.date_of_birth) {
    const age = Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    attrs.push(`${age} years old`);
  }
  if (user.body_type) attrs.push(user.body_type.charAt(0).toUpperCase() + user.body_type.slice(1));
  if (user.height_cm) attrs.push(`${user.height_cm} cm`);
  if (user.weight_kg) attrs.push(`${user.weight_kg} kg`);
  if (user.fitness_goal) attrs.push(formatGoal(user.fitness_goal));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate AI Avatar" size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Profile summary */}
        <div className="p-3 rounded-lg bg-neon-blue/5 border border-neon-blue/20">
          <p className="text-xs font-medium text-neon-blue mb-1">Profile attributes used for generation:</p>
          <p className="text-sm text-text-secondary">
            {attrs.length > 0 ? attrs.join(' · ') : 'No profile details set — a generic fitness avatar will be generated'}
          </p>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Appearance (Optional)
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Describe your look for a more personalized avatar.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(APPEARANCE_OPTIONS) as AppearanceKey[]).map((key) => {
              const opt = APPEARANCE_OPTIONS[key];
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    {opt.label}
                  </label>
                  <select
                    value={appearance[key]}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-lg bg-dark-200 border border-dark-100 text-text-primary text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                  >
                    <option value="">— Select —</option>
                    {opt.values.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Measurements */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Body Measurements (Optional)
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Add measurements for a more accurate avatar. All values in centimeters.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MEASUREMENT_FIELDS.map(({ key, label, placeholder }) => (
              <Input
                key={key}
                label={label}
                type="number"
                value={measurements[key]}
                onChange={(e) => updateMeasurement(key, e.target.value)}
                min={10}
                max={300}
                step={0.1}
                placeholder={placeholder}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        {generatedUrl && (
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-xs text-text-muted">Generated Avatar</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedUrl}
              alt="Generated avatar"
              className="w-48 h-48 rounded-2xl object-cover border-2 border-neon-pink/30"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleGenerate}
            loading={generating}
            disabled={generating}
          >
            {generating ? (
              'Generating...'
            ) : generatedUrl ? (
              <>
                <RefreshCw size={16} className="mr-1.5" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-1.5" />
                Generate Avatar
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

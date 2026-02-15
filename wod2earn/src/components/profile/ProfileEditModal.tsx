'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UserProfile, BodyType, Gender, FitnessGoal } from '@/types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const selectClasses =
  'w-full px-4 py-2.5 bg-dark-surface border border-card-border rounded-lg text-text-primary focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-colors';

export function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? '');
  const [heightCm, setHeightCm] = useState(user.height_cm?.toString() ?? '');
  const [weightKg, setWeightKg] = useState(user.weight_kg?.toString() ?? '');
  const [bodyType, setBodyType] = useState<BodyType | ''>(user.body_type ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth ?? '');
  const [gender, setGender] = useState<Gender | ''>(user.gender ?? '');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>(user.fitness_goal ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        display_name: displayName,
        avatar_url: avatarUrl || null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        body_type: bodyType || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        fitness_goal: fitnessGoal || null,
      };

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      onSave(data.user as UserProfile);
      onClose();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">Basic Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={50}
            />
            <Input
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
        </div>

        {/* Body Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">Body Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Height (cm)"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              min={50}
              max={300}
              step={0.1}
              placeholder="175"
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              min={20}
              max={500}
              step={0.1}
              placeholder="70"
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Body Type</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value as BodyType | '')}
                className={selectClasses}
              >
                <option value="">Not set</option>
                <option value="ectomorph">Ectomorph</option>
                <option value="mesomorph">Mesomorph</option>
                <option value="endomorph">Endomorph</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personal */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | '')}
                className={selectClasses}
              >
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goal */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">Goal</h3>
          <div className="w-full">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Fitness Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal | '')}
              className={selectClasses}
            >
              <option value="">Not set</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="build_muscle">Build Muscle</option>
              <option value="maintain">Maintain</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

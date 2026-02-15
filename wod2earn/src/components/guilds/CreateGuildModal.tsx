'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (slug: string) => void;
}

export function CreateGuildModal({ isOpen, onClose, onCreated }: CreateGuildModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create guild');
        return;
      }

      setName('');
      setDescription('');
      onCreated(data.guild.slug);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Guild">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="guild-name"
          label="Guild Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter guild name..."
          maxLength={50}
          required
        />
        <div>
          <label htmlFor="guild-desc" className="block text-sm font-medium text-text-secondary mb-1.5">
            Description (optional)
          </label>
          <textarea
            id="guild-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's your guild about?"
            maxLength={200}
            rows={3}
            className="w-full px-4 py-2.5 bg-dark-surface border border-card-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-colors resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Create Guild
          </Button>
        </div>
      </form>
    </Modal>
  );
}

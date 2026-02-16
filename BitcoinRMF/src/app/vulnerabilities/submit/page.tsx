'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { apiClient } from '@/lib/api-client';
import { AffectedComponent } from '@/types';
import Link from 'next/link';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';

export default function SubmitVulnerabilityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(3);
  const [exploitability, setExploitability] = useState(3);
  const [components, setComponents] = useState<string[]>([]);

  if (authLoading) {
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
            <p className="text-gray-400 mb-1">Sign in to submit vulnerabilities</p>
            <p className="text-xs text-gray-600">Community submissions require authentication</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await apiClient('/api/vulnerabilities', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          severity,
          exploitability,
          affectedComponents: components,
        }),
      });
      router.push('/vulnerabilities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComponent = (comp: string) => {
    setComponents((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/vulnerabilities" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to Vulnerabilities
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">Submit a Vulnerability</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submissions are reviewed by admins before publishing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f7931a]/50"
              placeholder="e.g., ECDSA Susceptibility to Quantum Attack"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f7931a]/50"
              placeholder="Describe the vulnerability in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Severity (1-5): {severity}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-[#f7931a]"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Negligible</span>
                <span>Critical</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Exploitability (1-5): {exploitability}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={exploitability}
                onChange={(e) => setExploitability(Number(e.target.value))}
                className="w-full accent-[#f7931a]"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Theoretical</span>
                <span>Trivial</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Vulnerability Score</p>
            <p className="text-2xl font-bold text-[#f7931a]">{severity * exploitability}<span className="text-sm text-gray-500">/25</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Affected Components</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(AffectedComponent).map((comp) => (
                <button
                  key={comp}
                  type="button"
                  onClick={() => toggleComponent(comp)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    components.includes(comp)
                      ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-400'
                      : 'border-[#2a2a3a] text-gray-500 hover:border-gray-500'
                  }`}
                >
                  {comp.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !name || !description}
            className="w-full bg-[#f7931a] text-black font-semibold py-2.5 rounded-lg hover:bg-[#f7931a]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Submit Vulnerability
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

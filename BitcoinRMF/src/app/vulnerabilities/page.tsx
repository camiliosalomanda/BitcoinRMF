'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SeverityBadge from '@/components/SeverityBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useVulnerabilities } from '@/hooks/useVulnerabilities';
import { VulnerabilityStatus, RiskRating, AffectedComponent } from '@/types';
import { Search, Bug } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<VulnerabilityStatus, string> = {
  [VulnerabilityStatus.DISCOVERED]: 'text-gray-400 bg-gray-400/10',
  [VulnerabilityStatus.CONFIRMED]: 'text-yellow-400 bg-yellow-400/10',
  [VulnerabilityStatus.EXPLOITABLE]: 'text-red-400 bg-red-400/10',
  [VulnerabilityStatus.PATCHED]: 'text-green-400 bg-green-400/10',
  [VulnerabilityStatus.MITIGATED]: 'text-blue-400 bg-blue-400/10',
};

export default function VulnerabilitiesPage() {
  const { data: vulnerabilities = [], isLoading } = useVulnerabilities();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VulnerabilityStatus | ''>('');
  const [ratingFilter, setRatingFilter] = useState<RiskRating | ''>('');

  const filtered = useMemo(() => {
    let result = [...vulnerabilities];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((v) => v.status === statusFilter);
    if (ratingFilter) result = result.filter((v) => v.vulnerabilityRating === ratingFilter);
    return result.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
  }, [vulnerabilities, searchQuery, statusFilter, ratingFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Vulnerabilities</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} of {vulnerabilities.length} vulnerabilities — Severity &times; Exploitability
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#f7931a]/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VulnerabilityStatus | '')}
            className="bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Statuses</option>
            {Object.values(VulnerabilityStatus).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as RiskRating | '')}
            className="bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Ratings</option>
            {Object.values(RiskRating).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : (
          <div className="space-y-3">
            {filtered.map((vuln) => (
              <Link
                key={vuln.id}
                href={`/vulnerabilities/${vuln.id}`}
                className="block bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Bug size={18} className="text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">{vuln.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{vuln.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[vuln.status]}`}>
                          {vuln.status.replace(/_/g, ' ')}
                        </span>
                        {vuln.affectedComponents.slice(0, 3).map((c) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400">
                            {c.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <SeverityBadge rating={vuln.vulnerabilityRating} size="sm" />
                    <p className="text-lg font-bold text-[#f7931a] mt-1">
                      {vuln.vulnerabilityScore}<span className="text-xs text-gray-500">/25</span>
                    </p>
                    <p className="text-[10px] text-gray-600">
                      S{vuln.severity} &times; E{vuln.exploitability}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-sm">No vulnerabilities match your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

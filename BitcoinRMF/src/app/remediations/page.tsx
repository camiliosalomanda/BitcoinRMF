'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RemediationCard from '@/components/remediations/RemediationCard';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useVulnerabilities } from '@/hooks/useVulnerabilities';
import { useBIPs } from '@/hooks/useBIPs';
import { RemediationStatus, RiskRating, RemediationStrategy, Vulnerability } from '@/types';
import { ArrowUpDown, Search } from 'lucide-react';

type SortField = 'severity' | 'effectiveness' | 'timeline' | 'status';
type SortDir = 'asc' | 'desc';

interface FlatRemediation {
  remediation: RemediationStrategy;
  parentVulnerability: Vulnerability;
}

const STATUS_ORDER: Record<RemediationStatus, number> = {
  IN_PROGRESS: 0,
  PLANNED: 1,
  DEFERRED: 2,
  COMPLETED: 3,
};

export default function RemediationsPage() {
  const { data: vulnerabilities = [], isLoading: vulnsLoading } = useVulnerabilities();
  const { data: allBIPs = [], isLoading: bipsLoading } = useBIPs();
  const isLoading = vulnsLoading || bipsLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RemediationStatus | ''>('');
  const [ratingFilter, setRatingFilter] = useState<RiskRating | ''>('');
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allRemediations = useMemo<FlatRemediation[]>(() => {
    return vulnerabilities.flatMap((vuln) =>
      vuln.remediationStrategies.map((rem) => ({
        remediation: rem,
        parentVulnerability: vuln,
      }))
    );
  }, [vulnerabilities]);

  const filteredRemediations = useMemo(() => {
    let result = [...allRemediations];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        ({ remediation, parentVulnerability }) =>
          remediation.title.toLowerCase().includes(q) ||
          remediation.description.toLowerCase().includes(q) ||
          parentVulnerability.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter(({ remediation }) => remediation.status === statusFilter);
    if (ratingFilter) result = result.filter(({ parentVulnerability }) => parentVulnerability.vulnerabilityRating === ratingFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'severity':
          cmp = a.parentVulnerability.vulnerabilityScore - b.parentVulnerability.vulnerabilityScore;
          break;
        case 'effectiveness':
          cmp = a.remediation.effectiveness - b.remediation.effectiveness;
          break;
        case 'timeline':
          cmp = a.remediation.timelineMonths - b.remediation.timelineMonths;
          break;
        case 'status':
          cmp = STATUS_ORDER[a.remediation.status] - STATUS_ORDER[b.remediation.status];
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [allRemediations, searchQuery, statusFilter, ratingFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Remediations</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredRemediations.length} of {allRemediations.length} remediation strategies
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search remediations or vulnerabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#f7931a]/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RemediationStatus | '')}
            className="bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DEFERRED">Deferred</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as RiskRating | '')}
            className="bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50"
          >
            <option value="">All Risk Ratings</option>
            {Object.values(RiskRating).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Sort buttons */}
          <div className="flex items-center gap-1">
            {(['severity', 'effectiveness', 'timeline', 'status'] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  sortField === field ? 'bg-[#f7931a]/10 text-[#f7931a]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {sortField === field && (
                  <ArrowUpDown size={10} className={sortDir === 'asc' ? 'rotate-180' : ''} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRemediations.map(({ remediation, parentVulnerability }) => (
              <RemediationCard
                key={remediation.id}
                remediation={remediation}
                parentVulnerability={parentVulnerability}
                allBIPs={allBIPs}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredRemediations.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-sm">No remediations match your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

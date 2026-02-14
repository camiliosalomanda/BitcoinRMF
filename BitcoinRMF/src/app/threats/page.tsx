'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ThreatCard from '@/components/threats/ThreatCard';
import ThreatFilters from '@/components/threats/ThreatFilters';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useThreats } from '@/hooks/useThreats';
import { STRIDECategory, ThreatSource, RiskRating, ThreatStatus } from '@/types';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { ArrowUpDown, Plus } from 'lucide-react';

type SortField = 'severity' | 'likelihood' | 'impact' | 'name';
type SortDir = 'asc' | 'desc';

export default function ThreatsPage() {
  const { data: threats = [], isLoading } = useThreats();
  const { isAuthenticated } = useUserRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [strideFilter, setStrideFilter] = useState<STRIDECategory | ''>('');
  const [sourceFilter, setSourceFilter] = useState<ThreatSource | ''>('');
  const [ratingFilter, setRatingFilter] = useState<RiskRating | ''>('');
  const [statusFilter, setStatusFilter] = useState<ThreatStatus | ''>('');
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filteredThreats = useMemo(() => {
    let result = [...threats];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.vulnerability.toLowerCase().includes(q)
      );
    }
    if (strideFilter) result = result.filter((t) => t.strideCategory === strideFilter);
    if (sourceFilter) result = result.filter((t) => t.threatSource === sourceFilter);
    if (ratingFilter) result = result.filter((t) => t.riskRating === ratingFilter);
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'severity':
          cmp = a.severityScore - b.severityScore;
          break;
        case 'likelihood':
          cmp = a.likelihood - b.likelihood;
          break;
        case 'impact':
          cmp = a.impact - b.impact;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [threats, searchQuery, strideFilter, sourceFilter, ratingFilter, statusFilter, sortField, sortDir]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Threat Register</h1>
            <p className="text-gray-500 text-sm mt-1">
              {filteredThreats.length} of {threats.length} threats
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Link
                href="/threats/submit"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20 rounded-lg hover:bg-[#f7931a]/20 transition-colors"
              >
                <Plus size={12} />
                Submit New
              </Link>
            )}
            {(['severity', 'likelihood', 'impact', 'name'] as SortField[]).map((field) => (
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

        <ThreatFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          strideFilter={strideFilter}
          onStrideChange={setStrideFilter}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
          ratingFilter={ratingFilter}
          onRatingChange={setRatingFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {isLoading ? (
          <ListSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredThreats.map((threat) => (
              <ThreatCard key={threat.id} threat={threat} />
            ))}
          </div>
        )}

        {!isLoading && filteredThreats.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-sm">No threats match your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

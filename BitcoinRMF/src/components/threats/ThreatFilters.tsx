'use client';

import { STRIDECategory, ThreatSource, RiskRating, ThreatStatus } from '@/types';
import { Search } from 'lucide-react';

interface ThreatFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  strideFilter: STRIDECategory | '';
  onStrideChange: (val: STRIDECategory | '') => void;
  sourceFilter: ThreatSource | '';
  onSourceChange: (val: ThreatSource | '') => void;
  ratingFilter: RiskRating | '';
  onRatingChange: (val: RiskRating | '') => void;
  statusFilter: ThreatStatus | '';
  onStatusChange: (val: ThreatStatus | '') => void;
}

const selectClass = 'bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#f7931a]/50';

export default function ThreatFilters({
  searchQuery,
  onSearchChange,
  strideFilter,
  onStrideChange,
  sourceFilter,
  onSourceChange,
  ratingFilter,
  onRatingChange,
  statusFilter,
  onStatusChange,
}: ThreatFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search threats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#f7931a]/50"
        />
      </div>

      {/* STRIDE Filter */}
      <select
        value={strideFilter}
        onChange={(e) => onStrideChange(e.target.value as STRIDECategory | '')}
        className={selectClass}
      >
        <option value="">All STRIDE</option>
        {Object.values(STRIDECategory).map((cat) => (
          <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {/* Source Filter */}
      <select
        value={sourceFilter}
        onChange={(e) => onSourceChange(e.target.value as ThreatSource | '')}
        className={selectClass}
      >
        <option value="">All Sources</option>
        {Object.values(ThreatSource).map((src) => (
          <option key={src} value={src}>{src.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {/* Rating Filter */}
      <select
        value={ratingFilter}
        onChange={(e) => onRatingChange(e.target.value as RiskRating | '')}
        className={selectClass}
      >
        <option value="">All Ratings</option>
        {Object.values(RiskRating).map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as ThreatStatus | '')}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {Object.values(ThreatStatus).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

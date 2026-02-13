'use client';

import { STRIDECategory } from '@/types';
import {
  UserX,
  FileEdit,
  FileQuestion,
  Eye,
  ShieldOff,
  ArrowUpCircle,
} from 'lucide-react';

const STRIDE_CONFIG: Record<STRIDECategory, { label: string; color: string; icon: React.ElementType }> = {
  [STRIDECategory.SPOOFING]: {
    label: 'Spoofing',
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    icon: UserX,
  },
  [STRIDECategory.TAMPERING]: {
    label: 'Tampering',
    color: 'text-red-400 bg-red-400/10 border-red-400/30',
    icon: FileEdit,
  },
  [STRIDECategory.REPUDIATION]: {
    label: 'Repudiation',
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    icon: FileQuestion,
  },
  [STRIDECategory.INFORMATION_DISCLOSURE]: {
    label: 'Info Disclosure',
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    icon: Eye,
  },
  [STRIDECategory.DENIAL_OF_SERVICE]: {
    label: 'Denial of Service',
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    icon: ShieldOff,
  },
  [STRIDECategory.ELEVATION_OF_PRIVILEGE]: {
    label: 'Elevation',
    color: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    icon: ArrowUpCircle,
  },
};

interface STRIDEBadgeProps {
  category: STRIDECategory;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export default function STRIDEBadge({ category, showIcon = true, size = 'md' }: STRIDEBadgeProps) {
  const config = STRIDE_CONFIG[category];
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${config.color} ${sizeClass}`}>
      {showIcon && <Icon size={iconSize} />}
      {config.label}
    </span>
  );
}

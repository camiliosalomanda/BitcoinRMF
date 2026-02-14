'use client';

import { useMemo } from 'react';
import { useThreats } from './useThreats';
import { useFUD } from './useFUD';
import type { EvidenceSource } from '@/types';

const X_URL_PATTERN = /^https?:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/\d+/;

export interface SocialEvidenceItem {
  source: EvidenceSource;
  parentType: 'threat' | 'fud';
  parentId: string;
  parentName: string;
  authorHandle: string | null;
}

export function useSocialEvidence() {
  const { data: threats = [] } = useThreats();
  const { data: fudItems = [] } = useFUD();

  const items = useMemo(() => {
    const result: SocialEvidenceItem[] = [];

    // Collect X_POST evidence from threats
    for (const threat of threats) {
      for (const src of threat.evidenceSources) {
        if (src.type === 'X_POST' && src.url) {
          const match = src.url.match(X_URL_PATTERN);
          result.push({
            source: src,
            parentType: 'threat',
            parentId: threat.id,
            parentName: threat.name,
            authorHandle: match?.[2] ?? null,
          });
        }
      }
    }

    // Collect X URLs from FUD evidenceFor / evidenceAgainst
    for (const fud of fudItems) {
      const allEvidence = [...(fud.evidenceFor || []), ...(fud.evidenceAgainst || [])];
      for (const ev of allEvidence) {
        const match = ev.match(X_URL_PATTERN);
        if (match) {
          result.push({
            source: { title: 'X Post', url: ev, type: 'X_POST' },
            parentType: 'fud',
            parentId: fud.id,
            parentName: fud.narrative,
            authorHandle: match[2] ?? null,
          });
        }
      }
    }

    return result;
  }, [threats, fudItems]);

  return items;
}

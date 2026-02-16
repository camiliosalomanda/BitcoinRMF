import type { Metadata } from 'next';
import { getThreatById } from '@/lib/data';
import { getBaseUrl } from '@/lib/url';
import RiskDetailPageClient from './RiskDetailPageClient';

interface Props {
  params: Promise<{ threatId: string; vulnId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threatId } = await params;
  const threat = await getThreatById(threatId);
  const baseUrl = getBaseUrl();

  if (!threat) {
    return { title: 'Risk Not Found — Bitcoin RMF' };
  }

  const title = `Risk: ${threat.name} | Bitcoin RMF`;
  const description = `Risk analysis for threat "${threat.name}" — Likelihood ${threat.likelihood}/5`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/risks/${threatId}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function RiskDetailPage() {
  return <RiskDetailPageClient />;
}

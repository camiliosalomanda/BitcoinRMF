import type { Metadata } from 'next';
import { getThreatById } from '@/lib/data';
import { getBaseUrl } from '@/lib/url';
import ThreatDetailPageClient from './ThreatDetailPageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const threat = await getThreatById(id);
  const baseUrl = getBaseUrl();

  if (!threat) {
    return { title: 'Threat Not Found — Bitcoin RMF' };
  }

  const title = `${threat.name} — ${threat.riskRating} Threat | Bitcoin RMF`;
  const description = threat.description.length > 160
    ? threat.description.slice(0, 157) + '…'
    : threat.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/threats/${id}`,
      images: [{ url: `/api/og?type=threat&id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?type=threat&id=${id}`],
    },
  };
}

export default function ThreatDetailPage() {
  return <ThreatDetailPageClient />;
}

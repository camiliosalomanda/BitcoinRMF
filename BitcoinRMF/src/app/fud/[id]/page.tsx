import type { Metadata } from 'next';
import { getFUDById } from '@/lib/data';
import { getBaseUrl } from '@/lib/url';
import FUDDetailPageClient from './FUDDetailPageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fud = await getFUDById(id);
  const baseUrl = getBaseUrl();

  if (!fud) {
    return { title: 'FUD Analysis Not Found — Bitcoin RMF' };
  }

  const title = `FUD: "${fud.narrative.length > 60 ? fud.narrative.slice(0, 57) + '…' : fud.narrative}" — ${fud.status.replace(/_/g, ' ')} | Bitcoin RMF`;
  const description = fud.debunkSummary.length > 160
    ? fud.debunkSummary.slice(0, 157) + '…'
    : fud.debunkSummary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/fud/${id}`,
      images: [{ url: `/api/og?type=fud&id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?type=fud&id=${id}`],
    },
  };
}

export default function FUDDetailPage() {
  return <FUDDetailPageClient />;
}

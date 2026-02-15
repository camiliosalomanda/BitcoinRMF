import type { Metadata } from 'next';
import { getBIPById } from '@/lib/data';
import { getBaseUrl } from '@/lib/url';
import BIPDetailPageClient from './BIPDetailPageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bip = await getBIPById(id);
  const baseUrl = getBaseUrl();

  if (!bip) {
    return { title: 'BIP Not Found — Bitcoin RMF' };
  }

  const title = `${bip.bipNumber}: ${bip.title} — ${bip.recommendation} | Bitcoin RMF`;
  const description = bip.summary.length > 160
    ? bip.summary.slice(0, 157) + '…'
    : bip.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/bips/${id}`,
      images: [{ url: `/api/og?type=bip&id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?type=bip&id=${id}`],
    },
  };
}

export default function BIPDetailPage() {
  return <BIPDetailPageClient />;
}

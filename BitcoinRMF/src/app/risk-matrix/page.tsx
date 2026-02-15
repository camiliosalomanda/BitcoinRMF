import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/url';
import RiskMatrixPageClient from './RiskMatrixPageClient';

export function generateMetadata(): Metadata {
  const baseUrl = getBaseUrl();

  return {
    title: 'Bitcoin Risk Matrix — 5×5 Threat Heatmap | Bitcoin RMF',
    description: '5×5 heatmap of the Bitcoin threat landscape mapped by Likelihood vs Impact using NIST RMF, FAIR, and STRIDE frameworks.',
    openGraph: {
      title: 'Bitcoin Risk Matrix — 5×5 Threat Heatmap | Bitcoin RMF',
      description: '5×5 heatmap of the Bitcoin threat landscape mapped by Likelihood vs Impact.',
      url: `${baseUrl}/risk-matrix`,
      images: [{ url: '/api/og?type=risk-matrix', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bitcoin Risk Matrix — 5×5 Threat Heatmap | Bitcoin RMF',
      description: '5×5 heatmap of the Bitcoin threat landscape mapped by Likelihood vs Impact.',
      images: ['/api/og?type=risk-matrix'],
    },
  };
}

export default function RiskMatrixPage() {
  return <RiskMatrixPageClient />;
}

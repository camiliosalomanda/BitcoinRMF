import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getThreatById, getBIPById, getFUDById } from '@/lib/data';

export const runtime = 'nodejs';

const BG = '#0a0a0f';
const CARD_BG = '#111118';
const BORDER = '#2a2a3a';
const ORANGE = '#f7931a';
const WHITE = '#f3f4f6';
const GRAY = '#9ca3af';

function Badge({ children, color }: { children: string; color: string }) {
  return (
    <span
      style={{
        color,
        fontSize: 20,
        fontWeight: 700,
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: '4px 16px',
      }}
    >
      {children}
    </span>
  );
}

function Layout({
  title,
  subtitle,
  badges,
  stat,
  statLabel,
}: {
  title: string;
  subtitle?: string;
  badges?: { text: string; color: string }[];
  stat?: string;
  statLabel?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: BG,
        padding: 60,
        justifyContent: 'space-between',
      }}
    >
      {/* Top: branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: ORANGE }}>₿</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: WHITE }}>Bitcoin RMF</span>
      </div>

      {/* Middle: main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          backgroundColor: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '40px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginRight: stat ? 40 : 0 }}>
            <h1
              style={{
                fontSize: title.length > 60 ? 28 : 36,
                fontWeight: 800,
                color: WHITE,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 18, color: GRAY, margin: 0, lineHeight: 1.4 }}>{subtitle}</p>
            )}
            {badges && badges.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {badges.map((b) => (
                  <Badge key={b.text} color={b.color}>{b.text}</Badge>
                ))}
              </div>
            )}
          </div>
          {stat && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 120,
              }}
            >
              <span style={{ fontSize: 56, fontWeight: 800, color: ORANGE }}>{stat}</span>
              {statLabel && <span style={{ fontSize: 14, color: GRAY }}>{statLabel}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: tagline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, color: GRAY }}>
          Institutional-Grade Risk Management for Bitcoin
        </span>
        <span style={{ fontSize: 14, color: GRAY }}>NIST RMF · FAIR · STRIDE</span>
      </div>
    </div>
  );
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  INFORMATIONAL: '#6b7280',
};

const REC_COLORS: Record<string, string> = {
  ESSENTIAL: '#22c55e',
  RECOMMENDED: '#3b82f6',
  OPTIONAL: '#eab308',
  UNNECESSARY: '#6b7280',
  HARMFUL: '#ef4444',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#ef4444',
  DEBUNKED: '#22c55e',
  PARTIALLY_VALID: '#eab308',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'default';
  const id = searchParams.get('id') || '';

  let element: React.ReactElement;

  switch (type) {
    case 'threat': {
      const threat = id ? await getThreatById(id) : null;
      if (threat) {
        element = (
          <Layout
            title={threat.name}
            subtitle={threat.description.length > 120 ? threat.description.slice(0, 120) + '…' : threat.description}
            badges={[
              { text: threat.riskRating, color: RISK_COLORS[threat.riskRating] || GRAY },
              { text: threat.strideCategory, color: ORANGE },
            ]}
            stat={`${threat.severityScore}`}
            statLabel="/25 Severity"
          />
        );
      } else {
        element = <Layout title="Threat Not Found" subtitle="This threat may have been removed or does not exist." />;
      }
      break;
    }
    case 'bip': {
      const bip = id ? await getBIPById(id) : null;
      if (bip) {
        element = (
          <Layout
            title={`${bip.bipNumber}: ${bip.title}`}
            subtitle={bip.summary.length > 120 ? bip.summary.slice(0, 120) + '…' : bip.summary}
            badges={[
              { text: bip.recommendation, color: REC_COLORS[bip.recommendation] || GRAY },
              { text: bip.status, color: GRAY },
            ]}
            stat={`${bip.necessityScore}`}
            statLabel="/100 Necessity"
          />
        );
      } else {
        element = <Layout title="BIP Not Found" subtitle="This BIP evaluation may have been removed or does not exist." />;
      }
      break;
    }
    case 'fud': {
      const fud = id ? await getFUDById(id) : null;
      if (fud) {
        const statusLabel = fud.status.replace(/_/g, ' ');
        element = (
          <Layout
            title={fud.narrative.length > 80 ? fud.narrative.slice(0, 80) + '…' : fud.narrative}
            subtitle={fud.debunkSummary.length > 120 ? fud.debunkSummary.slice(0, 120) + '…' : fud.debunkSummary}
            badges={[
              { text: statusLabel, color: STATUS_COLORS[fud.status] || GRAY },
              { text: fud.category, color: ORANGE },
            ]}
            stat={`${fud.validityScore}%`}
            statLabel="Validity"
          />
        );
      } else {
        element = <Layout title="FUD Analysis Not Found" subtitle="This FUD entry may have been removed or does not exist." />;
      }
      break;
    }
    case 'risk-matrix': {
      element = (
        <Layout
          title="Bitcoin Risk Matrix"
          subtitle="5×5 heatmap of the threat landscape — Likelihood vs Impact scored using NIST RMF, FAIR, and STRIDE frameworks"
          badges={[
            { text: 'NIST RMF', color: ORANGE },
            { text: 'FAIR', color: '#3b82f6' },
            { text: 'STRIDE', color: '#a855f7' },
          ]}
        />
      );
      break;
    }
    default: {
      element = (
        <Layout
          title="Bitcoin Risk Management Framework"
          subtitle="Institutional-grade risk analysis applying NIST RMF, FAIR, and STRIDE frameworks to Bitcoin's threat landscape"
          badges={[
            { text: 'Threats', color: '#ef4444' },
            { text: 'BIPs', color: '#3b82f6' },
            { text: 'FUD Tracker', color: '#22c55e' },
          ]}
        />
      );
    }
  }

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

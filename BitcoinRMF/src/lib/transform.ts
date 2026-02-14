import type {
  Threat,
  BIPEvaluation,
  FUDAnalysis,
  FAIREstimates,
  RemediationStrategy,
  EvidenceSource,
  LikelihoodLevel,
  ImpactLevel,
  STRIDECategory,
  ThreatSource,
  AffectedComponent,
  RiskRating,
  ThreatStatus,
  NistRmfStage,
  BIPRecommendation,
  FUDCategory,
  FUDStatus,
  RemediationStatus,
} from '@/types';
import { getSeverityRating, calculateSeverityScore } from '@/lib/scoring';

// =====================================================
// DB Row → Frontend Type (snake_case → camelCase)
// =====================================================

interface ThreatRow {
  id: string;
  name: string;
  description: string;
  stride_category: string;
  stride_rationale: string | null;
  threat_source: string;
  affected_components: string[];
  vulnerability: string | null;
  exploit_scenario: string | null;
  likelihood: number;
  likelihood_justification: string | null;
  impact: number;
  impact_justification: string | null;
  severity_score: number;
  risk_rating: string;
  fair_tef: number | null;
  fair_vulnerability: number | null;
  fair_lef: number | null;
  fair_primary_loss_usd: number | null;
  fair_secondary_loss_usd: number | null;
  fair_ale: number | null;
  nist_stage: string;
  status: string;
  related_bips: string[];
  evidence_sources: unknown;
  remediation_strategies?: unknown;
  date_identified: string;
  created_at: string;
  updated_at: string;
}

interface BIPRow {
  id: string;
  bip_number: string;
  title: string;
  summary: string | null;
  recommendation: string | null;
  necessity_score: number | null;
  threats_addressed: string[];
  mitigation_effectiveness: number | null;
  community_consensus: number | null;
  implementation_readiness: number | null;
  economic_impact: string | null;
  adoption_percentage: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface FUDRow {
  id: string;
  narrative: string;
  category: string;
  validity_score: number | null;
  status: string;
  evidence_for: string[];
  evidence_against: string[];
  debunk_summary: string | null;
  related_threats: string[];
  price_impact_estimate: string | null;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

function parseRemediationStrategies(raw: unknown, threatId: string): RemediationStrategy[] {
  if (!raw || !Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((r) => ({
    id: (r.id as string) || '',
    threatId,
    title: (r.title as string) || '',
    description: (r.description as string) || '',
    effectiveness: (r.effectiveness as number) || 0,
    estimatedCostUSD: (r.estimatedCostUSD as number) || (r.estimated_cost_usd as number) || 0,
    timelineMonths: (r.timelineMonths as number) || (r.timeline_months as number) || 0,
    status: ((r.status as string) || 'PLANNED') as RemediationStatus,
    relatedBIPs: (r.relatedBIPs as string[]) || (r.related_bips as string[]) || [],
  }));
}

function parseEvidenceSources(raw: unknown): EvidenceSource[] {
  if (!raw || !Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((e) => ({
    title: (e.title as string) || '',
    url: (e.url as string) || '',
    type: ((e.type as string) || 'RESEARCH') as EvidenceSource['type'],
  }));
}

export function threatFromRow(row: ThreatRow): Threat {
  const likelihood = row.likelihood as LikelihoodLevel;
  const impact = row.impact as ImpactLevel;
  const severityScore = row.severity_score ?? calculateSeverityScore(likelihood, impact);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    strideCategory: row.stride_category as STRIDECategory,
    strideRationale: row.stride_rationale || '',
    threatSource: row.threat_source as ThreatSource,
    affectedComponents: (row.affected_components || []) as AffectedComponent[],
    vulnerability: row.vulnerability || '',
    exploitScenario: row.exploit_scenario || '',
    likelihood,
    likelihoodJustification: row.likelihood_justification || '',
    impact,
    impactJustification: row.impact_justification || '',
    severityScore,
    riskRating: (row.risk_rating || getSeverityRating(severityScore)) as RiskRating,
    fairEstimates: {
      threatEventFrequency: Number(row.fair_tef) || 0,
      vulnerability: Number(row.fair_vulnerability) || 0,
      lossEventFrequency: Number(row.fair_lef) || 0,
      primaryLossUSD: Number(row.fair_primary_loss_usd) || 0,
      secondaryLossUSD: Number(row.fair_secondary_loss_usd) || 0,
      annualizedLossExpectancy: Number(row.fair_ale) || 0,
    },
    nistStage: (row.nist_stage || 'PREPARE') as NistRmfStage,
    status: (row.status || 'IDENTIFIED') as ThreatStatus,
    remediationStrategies: parseRemediationStrategies(row.remediation_strategies, row.id),
    relatedBIPs: row.related_bips || [],
    evidenceSources: parseEvidenceSources(row.evidence_sources),
    dateIdentified: row.date_identified || row.created_at,
    lastUpdated: row.updated_at,
  };
}

export function bipFromRow(row: BIPRow): BIPEvaluation {
  return {
    id: row.id,
    bipNumber: row.bip_number,
    title: row.title,
    summary: row.summary || '',
    recommendation: (row.recommendation || 'OPTIONAL') as BIPRecommendation,
    necessityScore: row.necessity_score ?? 0,
    threatsAddressed: row.threats_addressed || [],
    mitigationEffectiveness: row.mitigation_effectiveness ?? 0,
    communityConsensus: row.community_consensus ?? 0,
    implementationReadiness: row.implementation_readiness ?? 0,
    economicImpact: row.economic_impact || '',
    adoptionPercentage: row.adoption_percentage ?? 0,
    status: (row.status || 'PROPOSED') as BIPEvaluation['status'],
    lastUpdated: row.updated_at,
  };
}

export function fudFromRow(row: FUDRow): FUDAnalysis {
  return {
    id: row.id,
    narrative: row.narrative,
    category: row.category as FUDCategory,
    validityScore: row.validity_score ?? 50,
    status: (row.status || 'ACTIVE') as FUDStatus,
    evidenceFor: row.evidence_for || [],
    evidenceAgainst: row.evidence_against || [],
    debunkSummary: row.debunk_summary || '',
    relatedThreats: row.related_threats || [],
    priceImpactEstimate: row.price_impact_estimate || '',
    lastSeen: row.last_seen || row.created_at,
    lastUpdated: row.updated_at,
  };
}

// =====================================================
// Frontend Type → DB Row (camelCase → snake_case)
// =====================================================

export function threatToRow(threat: Threat): Record<string, unknown> {
  return {
    id: threat.id,
    name: threat.name,
    description: threat.description,
    stride_category: threat.strideCategory,
    stride_rationale: threat.strideRationale,
    threat_source: threat.threatSource,
    affected_components: threat.affectedComponents,
    vulnerability: threat.vulnerability,
    exploit_scenario: threat.exploitScenario,
    likelihood: threat.likelihood,
    likelihood_justification: threat.likelihoodJustification,
    impact: threat.impact,
    impact_justification: threat.impactJustification,
    fair_tef: threat.fairEstimates.threatEventFrequency,
    fair_vulnerability: threat.fairEstimates.vulnerability,
    fair_lef: threat.fairEstimates.lossEventFrequency,
    fair_primary_loss_usd: threat.fairEstimates.primaryLossUSD,
    fair_secondary_loss_usd: threat.fairEstimates.secondaryLossUSD,
    fair_ale: threat.fairEstimates.annualizedLossExpectancy,
    nist_stage: threat.nistStage,
    status: threat.status,
    remediation_strategies: threat.remediationStrategies,
    related_bips: threat.relatedBIPs,
    evidence_sources: threat.evidenceSources,
    date_identified: threat.dateIdentified,
  };
}

export function bipToRow(bip: BIPEvaluation): Record<string, unknown> {
  return {
    id: bip.id,
    bip_number: bip.bipNumber,
    title: bip.title,
    summary: bip.summary,
    recommendation: bip.recommendation,
    necessity_score: bip.necessityScore,
    threats_addressed: bip.threatsAddressed,
    mitigation_effectiveness: bip.mitigationEffectiveness,
    community_consensus: bip.communityConsensus,
    implementation_readiness: bip.implementationReadiness,
    economic_impact: bip.economicImpact,
    adoption_percentage: bip.adoptionPercentage,
    status: bip.status,
  };
}

export function fudToRow(fud: FUDAnalysis): Record<string, unknown> {
  return {
    id: fud.id,
    narrative: fud.narrative,
    category: fud.category,
    validity_score: fud.validityScore,
    status: fud.status,
    evidence_for: fud.evidenceFor,
    evidence_against: fud.evidenceAgainst,
    debunk_summary: fud.debunkSummary,
    related_threats: fud.relatedThreats,
    price_impact_estimate: fud.priceImpactEstimate,
    last_seen: fud.lastSeen,
  };
}

import {
  LikelihoodLevel,
  ImpactLevel,
  SeverityLevel,
  RiskRating,
  Threat,
  Vulnerability,
  DerivedRisk,
  RiskMatrixCell,
} from '@/types';

/**
 * Calculate severity score from likelihood × impact
 */
export function calculateSeverityScore(
  likelihood: LikelihoodLevel,
  impact: ImpactLevel
): number {
  return likelihood * impact;
}

/**
 * Map severity score (1-25) to risk rating
 */
export function getSeverityRating(score: number): RiskRating {
  if (score >= 20) return RiskRating.CRITICAL;
  if (score >= 12) return RiskRating.HIGH;
  if (score >= 6) return RiskRating.MEDIUM;
  if (score >= 3) return RiskRating.LOW;
  return RiskRating.VERY_LOW;
}

/**
 * Get Tailwind color class for risk rating
 */
export function getSeverityColor(rating: RiskRating): string {
  switch (rating) {
    case RiskRating.CRITICAL:
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case RiskRating.HIGH:
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case RiskRating.MEDIUM:
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case RiskRating.LOW:
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case RiskRating.VERY_LOW:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

/**
 * Get background color for risk matrix cell
 */
export function getMatrixCellColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 20) return 'bg-red-500/80';
  if (score >= 15) return 'bg-red-500/50';
  if (score >= 12) return 'bg-orange-500/50';
  if (score >= 8) return 'bg-yellow-500/40';
  if (score >= 5) return 'bg-yellow-500/20';
  if (score >= 3) return 'bg-green-500/20';
  return 'bg-green-500/10';
}

/**
 * Calculate FAIR annualized risk (Loss Event Frequency × Loss Magnitude)
 */
export function calculateFAIRRisk(
  tef: number,
  vulnerability: number,
  primaryLoss: number,
  secondaryLoss: number
): number {
  const lef = tef * vulnerability;
  return lef * (primaryLoss + secondaryLoss);
}

/**
 * Calculate BIP necessity score based on threat severities and mitigation effectiveness
 */
export function calculateBIPNecessityScore(
  threatSeverities: number[],
  mitigationEffectiveness: number
): number {
  if (threatSeverities.length === 0) return 0;
  const avgSeverity = threatSeverities.reduce((a, b) => a + b, 0) / threatSeverities.length;
  const normalizedSeverity = (avgSeverity / 25) * 100;
  return Math.min(100, Math.round(normalizedSeverity * (mitigationEffectiveness / 100)));
}

/**
 * Calculate FUD validity score (0 = total FUD, 100 = completely valid)
 */
export function calculateFUDValidityScore(
  evidenceFor: string[],
  evidenceAgainst: string[]
): number {
  const forCount = evidenceFor.length;
  const againstCount = evidenceAgainst.length;
  const total = forCount + againstCount;
  if (total === 0) return 50;
  return Math.round((forCount / total) * 100);
}

/**
 * Calculate vulnerability score from severity × exploitability
 */
export function calculateVulnerabilityScore(
  severity: SeverityLevel,
  exploitability: SeverityLevel
): number {
  return severity * exploitability;
}

/**
 * Derive risks from threat×vulnerability pairings
 */
export function deriveRisks(threats: Threat[], vulnerabilities: Vulnerability[]): DerivedRisk[] {
  const vulnMap = new Map(vulnerabilities.map((v) => [v.id, v]));
  const risks: DerivedRisk[] = [];

  for (const threat of threats) {
    for (const vulnId of threat.vulnerabilityIds) {
      const vuln = vulnMap.get(vulnId);
      if (!vuln) continue;
      const likelihood = threat.likelihood;
      const impact = vuln.severity;
      const riskScore = likelihood * impact;
      risks.push({
        threatId: threat.id,
        vulnerabilityId: vuln.id,
        threatName: threat.name,
        vulnerabilityName: vuln.name,
        likelihood,
        impact,
        riskScore,
        riskRating: getSeverityRating(riskScore),
        threat,
        vulnerability: vuln,
      });
    }
  }

  return risks.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Build 5x5 risk matrix from derived risks
 */
export function buildRiskMatrixFromRisks(risks: DerivedRisk[]): RiskMatrixCell[][] {
  const matrix: RiskMatrixCell[][] = [];

  for (let l = 5; l >= 1; l--) {
    const row: RiskMatrixCell[] = [];
    for (let i = 1; i <= 5; i++) {
      const cellRisks = risks.filter(
        (r) => r.likelihood === l && r.impact === i
      );
      const maxScore = cellRisks.length > 0
        ? Math.max(...cellRisks.map((r) => r.riskScore))
        : 0;
      row.push({
        likelihood: l as LikelihoodLevel,
        impact: i as ImpactLevel,
        threats: [],
        risks: cellRisks,
        count: cellRisks.length,
        maxSeverity: getSeverityRating(maxScore),
      });
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Build 5x5 risk matrix from threats (legacy fallback)
 */
export function buildRiskMatrix(threats: Threat[]): RiskMatrixCell[][] {
  const matrix: RiskMatrixCell[][] = [];

  for (let l = 5; l >= 1; l--) {
    const row: RiskMatrixCell[] = [];
    for (let i = 1; i <= 5; i++) {
      const cellThreats = threats.filter(
        (t) => t.likelihood === l && t.impact === i
      );
      const maxScore = cellThreats.length > 0
        ? Math.max(...cellThreats.map((t) => t.severityScore))
        : 0;
      row.push({
        likelihood: l as LikelihoodLevel,
        impact: i as ImpactLevel,
        threats: cellThreats,
        risks: [],
        count: cellThreats.length,
        maxSeverity: getSeverityRating(maxScore),
      });
    }
    matrix.push(row);
  }

  return matrix;
}

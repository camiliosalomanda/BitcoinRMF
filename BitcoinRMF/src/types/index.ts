// ===========================================
// Bitcoin RMF - Type System
// ===========================================

// --- Enums ---

export enum STRIDECategory {
  SPOOFING = 'SPOOFING',
  TAMPERING = 'TAMPERING',
  REPUDIATION = 'REPUDIATION',
  INFORMATION_DISCLOSURE = 'INFORMATION_DISCLOSURE',
  DENIAL_OF_SERVICE = 'DENIAL_OF_SERVICE',
  ELEVATION_OF_PRIVILEGE = 'ELEVATION_OF_PRIVILEGE',
}

export enum ThreatSource {
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  TECHNOLOGY = 'TECHNOLOGY',
  REGULATORY = 'REGULATORY',
  NETWORK = 'NETWORK',
  PROTOCOL = 'PROTOCOL',
  CRYPTOGRAPHIC = 'CRYPTOGRAPHIC',
  OPERATIONAL = 'OPERATIONAL',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
}

export enum AffectedComponent {
  CONSENSUS = 'CONSENSUS',
  P2P_NETWORK = 'P2P_NETWORK',
  WALLET = 'WALLET',
  MINING = 'MINING',
  SCRIPT_ENGINE = 'SCRIPT_ENGINE',
  CRYPTO_STACK = 'CRYPTO_STACK',
  FULL_NODE = 'FULL_NODE',
  SPV_CLIENT = 'SPV_CLIENT',
}

export type LikelihoodLevel = 1 | 2 | 3 | 4 | 5;
export type ImpactLevel = 1 | 2 | 3 | 4 | 5;

export enum RiskRating {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  VERY_LOW = 'VERY_LOW',
}

export enum ThreatStatus {
  IDENTIFIED = 'IDENTIFIED',
  ANALYZING = 'ANALYZING',
  MITIGATED = 'MITIGATED',
  ACCEPTED = 'ACCEPTED',
  MONITORING = 'MONITORING',
  ESCALATED = 'ESCALATED',
}

export enum NistRmfStage {
  PREPARE = 'PREPARE',
  CATEGORIZE = 'CATEGORIZE',
  SELECT = 'SELECT',
  IMPLEMENT = 'IMPLEMENT',
  ASSESS = 'ASSESS',
  AUTHORIZE = 'AUTHORIZE',
  MONITOR = 'MONITOR',
}

export enum BIPRecommendation {
  ESSENTIAL = 'ESSENTIAL',
  RECOMMENDED = 'RECOMMENDED',
  OPTIONAL = 'OPTIONAL',
  UNNECESSARY = 'UNNECESSARY',
  HARMFUL = 'HARMFUL',
}

export enum FUDCategory {
  QUANTUM = 'QUANTUM',
  REGULATION = 'REGULATION',
  CENTRALIZATION = 'CENTRALIZATION',
  ENERGY = 'ENERGY',
  SCALABILITY = 'SCALABILITY',
  COMPETITION = 'COMPETITION',
  SECURITY = 'SECURITY',
}

export type FUDStatus = 'ACTIVE' | 'DEBUNKED' | 'PARTIALLY_VALID';

export type RemediationStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED';

// --- Likelihood & Impact Labels ---

export const LIKELIHOOD_LABELS: Record<LikelihoodLevel, string> = {
  1: 'Rare',
  2: 'Unlikely',
  3: 'Possible',
  4: 'Likely',
  5: 'Almost Certain',
};

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  1: 'Negligible',
  2: 'Minor',
  3: 'Moderate',
  4: 'Major',
  5: 'Catastrophic',
};

// --- Core Interfaces ---

export interface FAIREstimates {
  threatEventFrequency: number; // Times per year threat could occur
  vulnerability: number;         // 0-1 probability of successful exploit
  lossEventFrequency: number;    // TEF × vulnerability
  primaryLossUSD: number;        // Direct financial loss
  secondaryLossUSD: number;      // Indirect losses (reputation, market cap)
  annualizedLossExpectancy: number; // LEF × (primary + secondary)
}

export interface EvidenceSource {
  title: string;
  url: string;
  type: 'RESEARCH' | 'CVE' | 'INCIDENT' | 'NEWS' | 'BIP' | 'WHITEPAPER' | 'X_POST';
}

export interface RemediationStrategy {
  id: string;
  threatId: string;
  title: string;
  description: string;
  effectiveness: number; // 0-100
  estimatedCostUSD: number;
  timelineMonths: number;
  status: RemediationStatus;
  relatedBIPs: string[];
}

export interface Threat {
  id: string;
  name: string;
  description: string;
  strideCategory: STRIDECategory;
  strideRationale: string;
  threatSource: ThreatSource;
  affectedComponents: AffectedComponent[];
  vulnerability: string;
  exploitScenario: string;
  likelihood: LikelihoodLevel;
  likelihoodJustification: string;
  impact: ImpactLevel;
  impactJustification: string;
  severityScore: number; // likelihood × impact (1-25)
  riskRating: RiskRating;
  fairEstimates: FAIREstimates;
  nistStage: NistRmfStage;
  status: ThreatStatus;
  remediationStrategies: RemediationStrategy[];
  relatedBIPs: string[];
  evidenceSources: EvidenceSource[];
  dateIdentified: string;
  lastUpdated: string;
  submittedBy?: string;
}

export interface BIPEvaluation {
  id: string;
  bipNumber: string;
  title: string;
  summary: string;
  recommendation: BIPRecommendation;
  necessityScore: number; // 0-100
  threatsAddressed: string[]; // threat IDs
  mitigationEffectiveness: number; // 0-100
  communityConsensus: number; // 0-100
  implementationReadiness: number; // 0-100
  economicImpact: string;
  adoptionPercentage: number; // 0-100
  status: 'DRAFT' | 'PROPOSED' | 'ACTIVE' | 'FINAL' | 'WITHDRAWN' | 'REPLACED';
  lastUpdated: string;
}

export interface FUDAnalysis {
  id: string;
  narrative: string;
  category: FUDCategory;
  validityScore: number; // 0-100 (0 = total FUD, 100 = completely valid)
  status: FUDStatus;
  evidenceFor: string[];
  evidenceAgainst: string[];
  debunkSummary: string;
  relatedThreats: string[]; // threat IDs
  priceImpactEstimate: string;
  lastSeen: string;
  lastUpdated: string;
  submittedBy?: string;
}

// --- Votes ---

export type VoteTargetType = 'threat' | 'fud';

export interface VoteSummary {
  approvals: number;
  rejections: number;
  netScore: number;
  userVote: 1 | -1 | null;
  threshold: number;
}

export interface RiskMatrixCell {
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  threats: Threat[];
  count: number;
  maxSeverity: RiskRating;
}

export interface DashboardStats {
  totalThreats: number;
  criticalHighCount: number;
  averageSeverity: number;
  activeRemediations: number;
  bipsPending: number;
  activeFUD: number;
  mitigatedThreats: number;
  monitoringThreats: number;
}

// --- Comments & Feedback ---

export type CommentTargetType = 'threat' | 'bip' | 'fud';

export interface CommentAuthor {
  xId: string;
  xUsername: string;
  xName: string;
  xProfileImage: string;
}

export interface Comment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  likes: number;
  likedBy: string[];
}

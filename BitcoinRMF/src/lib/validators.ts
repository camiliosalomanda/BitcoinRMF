import { z } from 'zod';
import { sanitizeInput } from './security';

// --- Shared enums as Zod ---

export const strideCategory = z.enum([
  'SPOOFING', 'TAMPERING', 'REPUDIATION',
  'INFORMATION_DISCLOSURE', 'DENIAL_OF_SERVICE', 'ELEVATION_OF_PRIVILEGE',
]);

export const threatSource = z.enum([
  'SOCIAL_MEDIA', 'TECHNOLOGY', 'REGULATORY', 'NETWORK',
  'PROTOCOL', 'CRYPTOGRAPHIC', 'OPERATIONAL', 'SUPPLY_CHAIN',
]);

export const affectedComponent = z.enum([
  'CONSENSUS', 'P2P_NETWORK', 'WALLET', 'MINING',
  'SCRIPT_ENGINE', 'CRYPTO_STACK', 'FULL_NODE', 'SPV_CLIENT',
]);

export const riskRating = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW']);

export const threatStatus = z.enum([
  'IDENTIFIED', 'ANALYZING', 'MITIGATED', 'ACCEPTED', 'MONITORING', 'ESCALATED',
]);

export const nistRmfStage = z.enum([
  'PREPARE', 'CATEGORIZE', 'SELECT', 'IMPLEMENT', 'ASSESS', 'AUTHORIZE', 'MONITOR',
]);

export const bipRecommendation = z.enum([
  'ESSENTIAL', 'RECOMMENDED', 'OPTIONAL', 'UNNECESSARY', 'HARMFUL',
]);

export const bipStatus = z.enum([
  'DRAFT', 'PROPOSED', 'ACTIVE', 'FINAL', 'WITHDRAWN', 'REPLACED',
]);

export const fudCategory = z.enum([
  'QUANTUM', 'REGULATION', 'CENTRALIZATION', 'ENERGY', 'SCALABILITY', 'COMPETITION', 'SECURITY',
]);

export const fudStatus = z.enum(['ACTIVE', 'DEBUNKED', 'PARTIALLY_VALID']);

export const remediationStatus = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED']);

export const workflowStatus = z.enum(['draft', 'published', 'archived', 'under_review']);

// --- Evidence Source ---

export const evidenceSourceSchema = z.object({
  title: z.string().transform(sanitizeInput),
  url: z.string().optional(),
  type: z.enum(['RESEARCH', 'CVE', 'INCIDENT', 'NEWS', 'BIP', 'WHITEPAPER', 'X_POST']),
});

// --- Remediation Strategy ---

export const remediationStrategySchema = z.object({
  id: z.string(),
  threatId: z.string(),
  title: z.string().transform(sanitizeInput),
  description: z.string().transform(sanitizeInput),
  effectiveness: z.number().min(0).max(100),
  estimatedCostUSD: z.number().min(0),
  timelineMonths: z.number().min(0),
  status: remediationStatus,
  relatedBIPs: z.array(z.string()),
});

// --- FAIR Estimates ---

export const fairEstimatesSchema = z.object({
  threatEventFrequency: z.number().min(0),
  vulnerability: z.number().min(0).max(1),
  lossEventFrequency: z.number().min(0),
  primaryLossUSD: z.number().min(0),
  secondaryLossUSD: z.number().min(0),
  annualizedLossExpectancy: z.number().min(0),
});

// --- Threat Input (for POST/PUT) ---

export const threatInputSchema = z.object({
  name: z.string().min(1).max(500).transform(sanitizeInput),
  description: z.string().min(1).max(10000).transform(sanitizeInput),
  strideCategory: strideCategory,
  strideRationale: z.string().transform(sanitizeInput).optional(),
  threatSource: threatSource,
  affectedComponents: z.array(affectedComponent),
  vulnerability: z.string().transform(sanitizeInput).optional(),
  exploitScenario: z.string().transform(sanitizeInput).optional(),
  likelihood: z.number().int().min(1).max(5),
  likelihoodJustification: z.string().transform(sanitizeInput).optional(),
  impact: z.number().int().min(1).max(5),
  impactJustification: z.string().transform(sanitizeInput).optional(),
  fairEstimates: fairEstimatesSchema.optional(),
  nistStage: nistRmfStage.optional(),
  status: threatStatus.optional(),
  remediationStrategies: z.array(remediationStrategySchema).optional(),
  relatedBIPs: z.array(z.string()).optional(),
  evidenceSources: z.array(evidenceSourceSchema).optional(),
});

export type ThreatInput = z.infer<typeof threatInputSchema>;

// --- BIP Input ---

export const bipInputSchema = z.object({
  bipNumber: z.string().min(1),
  title: z.string().min(1).max(500).transform(sanitizeInput),
  summary: z.string().transform(sanitizeInput).optional(),
  recommendation: bipRecommendation,
  necessityScore: z.number().int().min(0).max(100),
  threatsAddressed: z.array(z.string()).optional(),
  mitigationEffectiveness: z.number().int().min(0).max(100).optional(),
  communityConsensus: z.number().int().min(0).max(100).optional(),
  implementationReadiness: z.number().int().min(0).max(100).optional(),
  economicImpact: z.string().transform(sanitizeInput).optional(),
  adoptionPercentage: z.number().int().min(0).max(100).optional(),
  status: bipStatus.optional(),
});

export type BIPInput = z.infer<typeof bipInputSchema>;

// --- FUD Input ---

export const fudInputSchema = z.object({
  narrative: z.string().min(1).max(2000).transform(sanitizeInput),
  category: fudCategory,
  validityScore: z.number().int().min(0).max(100).optional(),
  status: fudStatus.optional(),
  evidenceFor: z.array(z.string()).optional(),
  evidenceAgainst: z.array(z.string()).optional(),
  debunkSummary: z.string().transform(sanitizeInput).optional(),
  relatedThreats: z.array(z.string()).optional(),
  priceImpactEstimate: z.string().transform(sanitizeInput).optional(),
});

export type FUDInput = z.infer<typeof fudInputSchema>;

// --- Vote Input ---

export const voteInputSchema = z.object({
  targetType: z.enum(['threat', 'fud']),
  targetId: z.string().min(1),
  voteValue: z.union([z.literal(1), z.literal(-1)]),
});

export type VoteInput = z.infer<typeof voteInputSchema>;

// --- Audit Log ---

export const auditLogSchema = z.object({
  id: z.string(),
  entityType: z.enum(['threat', 'bip', 'fud']),
  entityId: z.string(),
  action: z.enum(['create', 'update', 'delete', 'publish', 'archive', 'reject']),
  userId: z.string(),
  userName: z.string(),
  diff: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});

export type AuditLogEntry = z.infer<typeof auditLogSchema>;

// --- Status update ---

export const statusUpdateSchema = z.object({
  status: workflowStatus,
  reason: z.string().optional(),
});

// --- Score update ---

export const scoreUpdateSchema = z.object({
  field: z.string(),
  value: z.number(),
  reason: z.string().min(1, 'Reason is required for score changes').transform(sanitizeInput),
}).refine((data) => {
  if (data.field === 'likelihood' || data.field === 'impact') {
    return Number.isInteger(data.value) && data.value >= 1 && data.value <= 5;
  }
  if (data.field === 'fair_vulnerability') {
    return data.value >= 0 && data.value <= 1;
  }
  // All other numeric fields: non-negative
  return data.value >= 0;
}, { message: 'Value out of acceptable range for this field' });

// Core types for the BizAI Executive Platform

// ============================================
// Executive Types
// ============================================

export type ExecutiveRole = 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';

export interface Executive {
  id: string;
  role: ExecutiveRole;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  isActive: boolean;
}

// ============================================
// Message & Communication Types
// ============================================

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExecutiveMessage {
  id: string;
  fromExecutive: ExecutiveRole;
  toExecutive: ExecutiveRole | 'user' | 'all';
  subject: string;
  content: string;
  priority: MessagePriority;
  status: MessageStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  processedAt?: Date;
}

export interface ExecutiveRequest {
  id: string;
  fromExecutive: ExecutiveRole;
  toExecutive: ExecutiveRole;
  requestType: 'approval' | 'information' | 'collaboration' | 'review';
  subject: string;
  details: string;
  requiredBy?: Date;
  status: 'pending' | 'approved' | 'denied' | 'modified';
  response?: string;
  createdAt: Date;
}

// ============================================
// Company & Financial Types (CFO Focus)
// ============================================

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'micro' | 'small' | 'medium';
  fiscalYearEnd: string;
  currency: string;
  createdAt: Date;
}

export interface FinancialAccount {
  id: string;
  companyId: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  companyId: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  accountId: string;
  tags?: string[];
  recurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface Budget {
  id: string;
  companyId: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate: Date;
  categories: BudgetCategory[];
  status: 'draft' | 'active' | 'closed';
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  executiveOwner?: ExecutiveRole;
}

export interface CashFlowForecast {
  id: string;
  companyId: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  projections: CashFlowProjection[];
  assumptions: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface CashFlowProjection {
  date: Date;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  notes?: string;
}

// ============================================
// CFO-Specific Analysis Types
// ============================================

export interface FinancialInsight {
  id: string;
  companyId: string;
  type: 'warning' | 'opportunity' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface FinancialMetrics {
  companyId: string;
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  grossMargin: number;
  operatingMargin: number;
  currentRatio: number;
  quickRatio: number;
  burnRate?: number;
  runway?: number; // months
}

// ============================================
// AI Conversation Types
// ============================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  executive?: ExecutiveRole;
  timestamp: Date;
}

export interface ExecutiveConversation {
  id: string;
  companyId: string;
  executive: ExecutiveRole;
  messages: ConversationMessage[];
  context?: Record<string, unknown>;
  createdAt: Date;
  lastMessageAt: Date;
}

// ============================================
// Action & Task Types
// ============================================

export interface ExecutiveAction {
  id: string;
  executive: ExecutiveRole;
  actionType: string;
  description: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface ExecutiveTask {
  id: string;
  assignedTo: ExecutiveRole;
  createdBy: ExecutiveRole | 'user';
  title: string;
  description: string;
  priority: MessagePriority;
  dueDate?: Date;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  dependencies?: string[]; // Task IDs
  createdAt: Date;
}

// ============================================
// Marketing Types (CMO)
// ============================================

export interface MarketingCampaign {
  id: string;
  companyId: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversion' | 'retention';
  channels: MarketingChannel[];
  budget: number;
  spentAmount: number;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
  createdAt: Date;
}

export interface MarketingChannel {
  name: string;
  type: 'social' | 'email' | 'content' | 'paid_ads' | 'seo' | 'events' | 'partnerships';
  budget: number;
  allocation: number;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  cpa: number;
  roas: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  characteristics: string[];
  preferredChannels: string[];
  avgLifetimeValue: number;
  acquisitionCost: number;
}

export interface MarketingInsight {
  id: string;
  companyId: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  category: 'audience' | 'channel' | 'content' | 'competition' | 'budget';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

// ============================================
// Operations Types (COO)
// ============================================

export interface OperationalProcess {
  id: string;
  companyId: string;
  name: string;
  department: string;
  description: string;
  owner: string;
  steps: ProcessStep[];
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'under_review' | 'deprecated';
  metrics: ProcessMetrics;
  lastReviewDate: Date;
  nextReviewDate: Date;
  createdAt: Date;
}

export interface ProcessStep {
  id: string;
  order: number;
  name: string;
  description: string;
  responsible: string;
  estimatedDuration: number;
  dependencies: string[];
  tools?: string[];
  automatable: boolean;
}

export interface ProcessMetrics {
  avgCompletionTime: number;
  errorRate: number;
  throughput: number;
  bottleneckStep?: string;
  costPerUnit: number;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  category: 'supplier' | 'service_provider' | 'contractor' | 'technology' | 'logistics';
  contactName: string;
  contactEmail: string;
  contractValue: number;
  contractStart: Date;
  contractEnd: Date;
  performanceScore: number;
  status: 'active' | 'pending' | 'terminated' | 'under_review';
  notes: string;
  lastReviewDate: Date;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  leadTimeDays: number;
  supplier: string;
  location: string;
  lastRestocked: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

export interface CapacityPlan {
  id: string;
  companyId: string;
  resourceType: 'labor' | 'equipment' | 'space' | 'technology';
  resourceName: string;
  currentCapacity: number;
  currentUtilization: number;
  constraints: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface OperationalInsight {
  id: string;
  companyId: string;
  type: 'efficiency' | 'bottleneck' | 'risk' | 'opportunity' | 'cost_saving';
  category: 'process' | 'vendor' | 'inventory' | 'capacity' | 'quality';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

// ============================================
// Technology Types (CTO)
// ============================================

export interface TechnologyStack {
  id: string;
  companyId: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'devops' | 'security' | 'analytics' | 'communication';
  name: string;
  version?: string;
  purpose: string;
  vendor?: string;
  monthlyCost: number;
  status: 'active' | 'deprecated' | 'evaluating' | 'planned';
  criticality: 'critical' | 'important' | 'nice_to_have';
  lastUpdated: Date;
  nextReviewDate: Date;
}

export interface TechProject {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: 'new_feature' | 'infrastructure' | 'security' | 'maintenance' | 'integration' | 'migration';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'planning' | 'in_progress' | 'testing' | 'deployed' | 'cancelled';
  estimatedHours: number;
  actualHours: number;
  startDate?: Date;
  targetDate?: Date;
  completedDate?: Date;
  assignedTo: string[];
  dependencies: string[];
  createdAt: Date;
}

export interface SecurityAssessment {
  id: string;
  companyId: string;
  assessmentDate: Date;
  overallScore: number;
  categories: SecurityCategory[];
  criticalFindings: SecurityFinding[];
  recommendations: string[];
  nextAssessmentDate: Date;
}

export interface SecurityCategory {
  name: string;
  score: number;
  findings: number;
  status: 'good' | 'needs_attention' | 'critical';
}

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  dueDate?: Date;
}

export interface TechDebt {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: 'code_quality' | 'architecture' | 'dependencies' | 'documentation' | 'testing' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: number;
  businessImpact: string;
  status: 'identified' | 'planned' | 'in_progress' | 'resolved';
  createdAt: Date;
}

export interface TechInsight {
  id: string;
  companyId: string;
  type: 'security' | 'performance' | 'cost' | 'scalability' | 'maintenance' | 'opportunity';
  category: 'infrastructure' | 'application' | 'data' | 'security' | 'integration';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  estimatedSavings?: number;
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

// ============================================
// Human Resources Types (CHRO)
// ============================================

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  employmentType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  startDate: Date;
  manager?: string;
  salary?: number;
  status: 'active' | 'on_leave' | 'terminated' | 'offboarding';
  skills: string[];
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  department: string;
  level: Employee['level'];
  employmentType: Employee['employmentType'];
  description: string;
  requirements: string[];
  niceToHave: string[];
  salaryRange?: { min: number; max: number };
  location: 'remote' | 'hybrid' | 'onsite';
  status: 'draft' | 'open' | 'paused' | 'closed' | 'filled';
  postedDate?: Date;
  applicantCount: number;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  jobPostingId: string;
  firstName: string;
  lastName: string;
  email: string;
  source: 'job_board' | 'referral' | 'linkedin' | 'website' | 'agency' | 'other';
  status: 'new' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  rating?: number;
  notes: string;
  appliedDate: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  reviewDate: Date;
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  status: 'draft' | 'submitted' | 'acknowledged' | 'completed';
}

export interface TrainingProgram {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: 'onboarding' | 'skills' | 'compliance' | 'leadership' | 'professional_development';
  format: 'in_person' | 'online' | 'hybrid' | 'self_paced';
  duration: number;
  mandatory: boolean;
  targetAudience: string[];
  completionRate: number;
  status: 'active' | 'archived' | 'development';
}

export interface EmployeeEngagement {
  id: string;
  companyId: string;
  surveyDate: Date;
  overallScore: number;
  responseRate: number;
  topStrengths: string[];
  topConcerns: string[];
  actionItems: string[];
}

export interface HRPolicy {
  id: string;
  companyId: string;
  name: string;
  category: 'time_off' | 'compensation' | 'conduct' | 'benefits' | 'remote_work' | 'safety' | 'dei';
  description: string;
  effectiveDate: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  status: 'draft' | 'active' | 'under_review' | 'archived';
}

export interface HRInsight {
  id: string;
  companyId: string;
  type: 'retention' | 'engagement' | 'hiring' | 'compliance' | 'culture' | 'development';
  category: 'workforce' | 'talent' | 'culture' | 'compliance' | 'compensation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

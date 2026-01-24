/**
 * BizAI Executive Types
 * Defines the core interfaces for AI C-level executives
 */

// Executive roles available in the platform
export type ExecutiveRole = 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';

// Message priority levels for inter-executive communication
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

// Status of an executive task or request
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

/**
 * Base interface for all AI executives
 */
export interface Executive {
  id: string;
  role: ExecutiveRole;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Message passed between executives
 */
export interface ExecutiveMessage {
  id: string;
  fromExecutive: ExecutiveRole;
  toExecutive: ExecutiveRole | 'ALL'; // Can broadcast to all
  subject: string;
  content: string;
  priority: MessagePriority;
  status: TaskStatus;
  requiresResponse: boolean;
  parentMessageId?: string; // For threading
  metadata?: Record<string, unknown>;
  createdAt: Date;
  respondedAt?: Date;
}

/**
 * A decision or recommendation from an executive
 */
export interface ExecutiveDecision {
  id: string;
  executiveRole: ExecutiveRole;
  type: 'approval' | 'rejection' | 'recommendation' | 'alert' | 'request';
  title: string;
  summary: string;
  details: string;
  confidence: number; // 0-1 scale
  impactAreas: ExecutiveRole[]; // Which other executives should be notified
  actionRequired: boolean;
  deadline?: Date;
  supportingData?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Company context shared across all executives
 */
export interface CompanyContext {
  id: string;
  name: string;
  industry: string;
  size: 'micro' | 'small' | 'medium'; // 1-10, 11-50, 51-250 employees
  annualRevenue?: number;
  employeeCount?: number;
  fiscalYearEnd: string; // e.g., "December"
  currency: string;
  timezone: string;
  goals: string[];
  challenges: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CFO-specific types
 */
export interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  unit: string;
  category: 'revenue' | 'expense' | 'profit' | 'cashflow' | 'ratio' | 'other';
  period: string;
  trend: 'up' | 'down' | 'stable';
  isHealthy: boolean;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  department: ExecutiveRole;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
  status: 'under' | 'on_track' | 'at_risk' | 'over';
}

export interface CashFlowProjection {
  id: string;
  period: string;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  runwayMonths: number;
  alerts: string[];
}

export interface FinancialReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: string;
  metrics: FinancialMetric[];
  insights: string[];
  recommendations: ExecutiveDecision[];
  generatedAt: Date;
}

/**
 * Chat/conversation types for the UI
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  executive?: ExecutiveRole;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  executive: ExecutiveRole;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

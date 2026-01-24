/**
 * Company Types
 * Type definitions for multi-company support
 */

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'solo' | 'small' | 'medium' | 'large';
  description?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings: CompanySettings;
  onboardingCompleted: boolean;
}

export interface CompanySettings {
  timezone: string;
  currency: string;
  fiscalYearStart: number; // Month 1-12
  enabledExecutives: string[];
  integrations: CompanyIntegration[];
}

export interface CompanyIntegration {
  type: 'quickbooks' | 'xero' | 'stripe' | 'hubspot' | 'salesforce' | 'slack' | 'google' | 'github';
  enabled: boolean;
  connectedAt?: Date;
  config?: Record<string, unknown>;
}

export interface CompanyMember {
  id: string;
  userId: string;
  companyId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  invitedBy?: string;
}

export interface CompanyInvite {
  id: string;
  companyId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

// Company size labels
export const COMPANY_SIZE_LABELS: Record<Company['size'], string> = {
  solo: 'Just me',
  small: '2-10 employees',
  medium: '11-50 employees',
  large: '50+ employees',
};

// Industry options
export const INDUSTRY_OPTIONS = [
  'Technology',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Real Estate',
  'Food & Beverage',
  'Media & Entertainment',
  'Non-profit',
  'Other',
] as const;

// Default company settings
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  timezone: 'America/New_York',
  currency: 'USD',
  fiscalYearStart: 1,
  enabledExecutives: ['CFO', 'CMO', 'COO', 'CHRO', 'CTO', 'CCO'],
  integrations: [],
};

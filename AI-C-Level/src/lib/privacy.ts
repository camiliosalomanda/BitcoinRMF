/**
 * GDPR & Privacy Compliance Utilities
 * Handles consent management, data export, and deletion
 */

import { supabase } from './supabase';
import { logAudit } from './auditLog';

// Consent types required under GDPR
export type ConsentType = 
  | 'essential'      // Required for service (cannot be declined)
  | 'analytics'      // Usage analytics
  | 'marketing'      // Marketing communications
  | 'ai_processing'  // AI processing of data
  | 'third_party';   // Third-party data sharing

export interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedAt: Date;
  ipAddress: string;
  version: string; // Policy version at time of consent
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  retainedData?: string[]; // Legal reasons for retention
}

// Current privacy policy version
export const PRIVACY_POLICY_VERSION = '1.0.0';

/**
 * Record user consent
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentType,
  granted: boolean,
  ipAddress: string
): Promise<void> {
  const record: ConsentRecord = {
    userId,
    consentType,
    granted,
    grantedAt: new Date(),
    ipAddress,
    version: PRIVACY_POLICY_VERSION,
  };

  if (supabase) {
    await supabase.from('consent_records').insert({
      user_id: record.userId,
      consent_type: record.consentType,
      granted: record.granted,
      granted_at: record.grantedAt.toISOString(),
      ip_address: record.ipAddress,
      policy_version: record.version,
    });
  }

  // Audit log
  await logAudit({
    userId,
    action: granted ? 'compliance.consent_given' : 'compliance.consent_withdrawn',
    resource: 'consent',
    resourceId: consentType,
    ipAddress,
    success: true,
    details: { consentType, granted, policyVersion: PRIVACY_POLICY_VERSION },
    dataCategory: 'personal',
  });
}

/**
 * Get user's current consent status
 */
export async function getConsentStatus(userId: string): Promise<Record<ConsentType, boolean>> {
  const defaults: Record<ConsentType, boolean> = {
    essential: true, // Always required
    analytics: false,
    marketing: false,
    ai_processing: false,
    third_party: false,
  };

  if (!supabase) return defaults;

  const { data } = await supabase
    .from('consent_records')
    .select('consent_type, granted')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false });

  if (!data) return defaults;

  // Get latest consent for each type
  const latestConsents = new Map<ConsentType, boolean>();
  for (const record of data) {
    if (!latestConsents.has(record.consent_type)) {
      latestConsents.set(record.consent_type, record.granted);
    }
  }

  return {
    ...defaults,
    ...Object.fromEntries(latestConsents),
  };
}

/**
 * Check if user has granted specific consent
 */
export async function hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
  if (consentType === 'essential') return true;
  
  const status = await getConsentStatus(userId);
  return status[consentType] || false;
}

/**
 * Request data export (GDPR Article 20 - Right to Data Portability)
 */
export async function requestDataExport(
  userId: string,
  ipAddress: string
): Promise<DataExportRequest> {
  const request: DataExportRequest = {
    id: `export-${Date.now()}`,
    userId,
    status: 'pending',
    requestedAt: new Date(),
  };

  if (supabase) {
    await supabase.from('data_export_requests').insert({
      id: request.id,
      user_id: request.userId,
      status: request.status,
      requested_at: request.requestedAt.toISOString(),
    });
  }

  await logAudit({
    userId,
    action: 'compliance.data_exported',
    ipAddress,
    success: true,
    details: { requestId: request.id },
    dataCategory: 'personal',
  });

  return request;
}

/**
 * Generate data export package
 */
export async function generateDataExport(userId: string): Promise<object> {
  // Collect all user data
  const exportData: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    userId,
    dataCategories: [] as string[],
  };

  if (supabase) {
    // User profile
    const { data: profile } = await supabase
      .from('users')
      .select('email, name, created_at')
      .eq('id', userId)
      .single();
    
    if (profile) {
      exportData.profile = profile;
      (exportData.dataCategories as string[]).push('profile');
    }

    // Companies
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', userId);
    
    if (companies?.length) {
      exportData.companies = companies;
      (exportData.dataCategories as string[]).push('companies');
    }

    // Chat history (if stored)
    const { data: chats } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId);
    
    if (chats?.length) {
      exportData.chatHistory = chats;
      (exportData.dataCategories as string[]).push('chatHistory');
    }

    // Consent records
    const { data: consents } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId);
    
    if (consents?.length) {
      exportData.consentHistory = consents;
      (exportData.dataCategories as string[]).push('consentHistory');
    }
  }

  return exportData;
}

/**
 * Request data deletion (GDPR Article 17 - Right to Erasure)
 */
export async function requestDataDeletion(
  userId: string,
  ipAddress: string
): Promise<DataDeletionRequest> {
  const request: DataDeletionRequest = {
    id: `deletion-${Date.now()}`,
    userId,
    status: 'pending',
    requestedAt: new Date(),
  };

  if (supabase) {
    await supabase.from('data_deletion_requests').insert({
      id: request.id,
      user_id: request.userId,
      status: request.status,
      requested_at: request.requestedAt.toISOString(),
    });
  }

  await logAudit({
    userId,
    action: 'compliance.data_deletion_requested',
    ipAddress,
    success: true,
    details: { requestId: request.id },
    dataCategory: 'personal',
  });

  return request;
}

/**
 * Execute data deletion
 * Note: Some data may be retained for legal/compliance reasons
 */
export async function executeDataDeletion(userId: string): Promise<{
  deleted: string[];
  retained: { category: string; reason: string }[];
}> {
  const deleted: string[] = [];
  const retained: { category: string; reason: string }[] = [];

  if (!supabase) {
    return { deleted, retained };
  }

  // Delete chat messages
  await supabase.from('chat_messages').delete().eq('user_id', userId);
  deleted.push('chat_messages');

  // Delete uploaded files
  await supabase.from('uploaded_files').delete().eq('user_id', userId);
  deleted.push('uploaded_files');

  // Delete companies (if sole owner)
  await supabase.from('companies').delete().eq('owner_id', userId);
  deleted.push('companies');

  // Anonymize audit logs (retain for compliance)
  await supabase
    .from('audit_logs')
    .update({ user_id: null, ip_address: 'DELETED' })
    .eq('user_id', userId);
  retained.push({
    category: 'audit_logs',
    reason: 'Required for security compliance (anonymized)',
  });

  // Retain consent records (legal requirement)
  retained.push({
    category: 'consent_records',
    reason: 'Required to demonstrate GDPR compliance',
  });

  // Finally delete user account
  await supabase.from('users').delete().eq('id', userId);
  deleted.push('user_account');

  return { deleted, retained };
}

/**
 * Get privacy policy acceptance status
 */
export async function hasAcceptedPrivacyPolicy(userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { data } = await supabase
    .from('consent_records')
    .select('policy_version')
    .eq('user_id', userId)
    .eq('consent_type', 'essential')
    .eq('granted', true)
    .order('granted_at', { ascending: false })
    .limit(1)
    .single();

  return data?.policy_version === PRIVACY_POLICY_VERSION;
}

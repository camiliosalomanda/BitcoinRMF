/**
 * Audit Logging System
 * Tracks all security-relevant actions for compliance
 * 
 * Supports: GDPR, SOC 2, HIPAA audit requirements
 */

import { supabase } from './supabase';

export type AuditAction = 
  // Authentication
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.password_reset'
  | 'auth.password_changed'
  | 'auth.mfa_enabled'
  | 'auth.mfa_disabled'
  // Data Access
  | 'data.view'
  | 'data.create'
  | 'data.update'
  | 'data.delete'
  | 'data.export'
  // File Operations
  | 'file.upload'
  | 'file.download'
  | 'file.delete'
  // AI Interactions
  | 'ai.chat'
  | 'ai.insight_generated'
  // Admin Actions
  | 'admin.user_created'
  | 'admin.user_deleted'
  | 'admin.role_changed'
  | 'admin.settings_changed'
  // Security Events
  | 'security.rate_limit'
  | 'security.unauthorized'
  | 'security.suspicious_activity'
  // Compliance
  | 'compliance.consent_given'
  | 'compliance.consent_withdrawn'
  | 'compliance.data_deletion_requested'
  | 'compliance.data_exported';

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  userId: string | null;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  // Compliance metadata
  dataCategory?: 'personal' | 'financial' | 'health' | 'business';
  retentionDays?: number;
}

// In-memory buffer for batch writes (production should use proper queue)
const auditBuffer: AuditLogEntry[] = [];
const BUFFER_FLUSH_INTERVAL = 5000; // 5 seconds
const BUFFER_MAX_SIZE = 100;

/**
 * Log an audit event
 */
export async function logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const fullEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(fullEntry, null, 2));
  }

  // Add to buffer
  auditBuffer.push(fullEntry);

  // Flush if buffer is full
  if (auditBuffer.length >= BUFFER_MAX_SIZE) {
    await flushAuditBuffer();
  }
}

/**
 * Flush audit buffer to database
 */
async function flushAuditBuffer(): Promise<void> {
  if (auditBuffer.length === 0) return;

  const entries = auditBuffer.splice(0, auditBuffer.length);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(entries.map(e => ({
          user_id: e.userId,
          action: e.action,
          resource: e.resource,
          resource_id: e.resourceId,
          details: e.details,
          ip_address: e.ipAddress,
          user_agent: e.userAgent,
          success: e.success,
          error_message: e.errorMessage,
          data_category: e.dataCategory,
          created_at: e.timestamp,
        })));

      if (error) {
        console.error('Failed to write audit logs:', error);
        // Re-add to buffer for retry
        auditBuffer.push(...entries);
      }
    } catch (err) {
      console.error('Audit logging error:', err);
      auditBuffer.push(...entries);
    }
  }
}

// Periodic flush
if (typeof setInterval !== 'undefined') {
  setInterval(flushAuditBuffer, BUFFER_FLUSH_INTERVAL);
}

/**
 * Query audit logs (admin only)
 */
export async function queryAuditLogs(params: {
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  if (!supabase) {
    console.warn('Database not configured for audit log queries');
    return [];
  }

  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 100);

  if (params.userId) {
    query = query.eq('user_id', params.userId);
  }
  if (params.action) {
    query = query.eq('action', params.action);
  }
  if (params.startDate) {
    query = query.gte('created_at', params.startDate.toISOString());
  }
  if (params.endDate) {
    query = query.lte('created_at', params.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to query audit logs:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    timestamp: row.created_at,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    details: row.details,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    success: row.success,
    errorMessage: row.error_message,
    dataCategory: row.data_category,
  }));
}

/**
 * Helper: Log authentication event
 */
export function logAuthEvent(
  action: 'auth.login' | 'auth.logout' | 'auth.login_failed' | 'auth.password_reset' | 'auth.password_changed',
  userId: string | null,
  ipAddress: string,
  success: boolean,
  details?: Record<string, unknown>
): void {
  logAudit({
    userId,
    action,
    ipAddress,
    success,
    details,
    dataCategory: 'personal',
  });
}

/**
 * Helper: Log data access event
 */
export function logDataAccess(
  action: 'data.view' | 'data.create' | 'data.update' | 'data.delete' | 'data.export',
  userId: string,
  resource: string,
  resourceId: string,
  ipAddress: string,
  dataCategory: AuditLogEntry['dataCategory'] = 'business'
): void {
  logAudit({
    userId,
    action,
    resource,
    resourceId,
    ipAddress,
    success: true,
    dataCategory,
  });
}

/**
 * Helper: Log AI interaction
 */
export function logAIInteraction(
  userId: string,
  executive: string,
  ipAddress: string,
  tokenCount?: number
): void {
  logAudit({
    userId,
    action: 'ai.chat',
    resource: 'executive',
    resourceId: executive,
    ipAddress,
    success: true,
    details: tokenCount ? { tokenCount } : undefined,
    dataCategory: 'business',
  });
}

/**
 * Helper: Log security event
 */
export function logSecurityIncident(
  type: 'security.rate_limit' | 'security.unauthorized' | 'security.suspicious_activity',
  ipAddress: string,
  details: Record<string, unknown>,
  userId?: string
): void {
  logAudit({
    userId: userId || null,
    action: type,
    ipAddress,
    success: false,
    details,
  });
}

import { getDb } from '../db';

/**
 * Audit Logging System
 * 
 * Logs all security-critical events for:
 * - Compliance (GDPR, SOC 2)
 * - Fraud detection
 * - Breach investigation
 * - User activity tracking
 * 
 * IMPORTANT: Audit logs should be stored in a separate, append-only database
 * for maximum security. For now, we'll use the main database but mark for migration.
 */

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  
  // Financial events
  PAYOUT_REQUESTED = 'payout_requested',
  PAYOUT_APPROVED = 'payout_approved',
  PAYOUT_REJECTED = 'payout_rejected',
  PAYOUT_COMPLETED = 'payout_completed',
  PAYOUT_FAILED = 'payout_failed',
  BANK_ACCOUNT_ADDED = 'bank_account_added',
  BANK_ACCOUNT_UPDATED = 'bank_account_updated',
  BANK_ACCOUNT_DELETED = 'bank_account_deleted',
  
  // Account changes
  EMAIL_CHANGED = 'email_changed',
  PHONE_CHANGED = 'phone_changed',
  PASSWORD_CHANGED = 'password_changed',
  PROFILE_UPDATED = 'profile_updated',
  ACCOUNT_DELETED = 'account_deleted',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_TOKEN_INVALID = 'csrf_token_invalid',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  
  // Data access
  SENSITIVE_DATA_ACCESSED = 'sensitive_data_accessed',
  BULK_DATA_EXPORT = 'bulk_data_export',
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log an audit event
 * 
 * @param entry - Audit log entry
 * 
 * @example
 * await logAuditEvent({
 *   eventType: AuditEventType.LOGIN_SUCCESS,
 *   userId: 123,
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent'],
 *   success: true,
 *   metadata: { method: 'email' },
 *   timestamp: new Date(),
 * });
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[AuditLog] Database not available, cannot log event');
    return;
  }
  
  try {
    // TODO: Create audit_logs table in schema
    // For now, log to console (will be replaced with database insert)
    console.log('[AUDIT]', {
      timestamp: entry.timestamp.toISOString(),
      eventType: entry.eventType,
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      success: entry.success,
      metadata: entry.metadata,
    });
    
    // Future implementation:
    // await db.insert(auditLogs).values({
    //   eventType: entry.eventType,
    //   userId: entry.userId,
    //   ipAddress: entry.ipAddress,
    //   userAgent: entry.userAgent,
    //   success: entry.success,
    //   metadata: JSON.stringify(entry.metadata),
    //   timestamp: entry.timestamp,
    // });
  } catch (error) {
    console.error('[AuditLog] Failed to log event:', error);
    // Never throw - audit logging should not break application flow
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  eventType: AuditEventType,
  userId: number | undefined,
  success: boolean,
  req: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    success,
    metadata,
    timestamp: new Date(),
  });
}

/**
 * Log financial event
 */
export async function logFinancialEvent(
  eventType: AuditEventType,
  userId: number,
  success: boolean,
  req: any,
  metadata: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    success,
    metadata: {
      ...metadata,
      // Always log amount for financial events
      amount: metadata.amount,
      currency: metadata.currency || 'USD',
    },
    timestamp: new Date(),
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  reason: string,
  userId: number | undefined,
  req: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    success: false,
    metadata: {
      reason,
      ...metadata,
    },
    timestamp: new Date(),
  });
  
  // TODO: Trigger alert to security team
  console.warn('[SECURITY ALERT] Suspicious activity detected:', {
    reason,
    userId,
    ip: req.ip,
  });
}

/**
 * Get audit logs for a user (for compliance/support)
 * 
 * @param userId - User ID
 * @param limit - Maximum number of logs to return
 * @returns Array of audit log entries
 */
export async function getUserAuditLogs(
  userId: number,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }
  
  try {
    // TODO: Implement once audit_logs table exists
    // const logs = await db
    //   .select()
    //   .from(auditLogs)
    //   .where(eq(auditLogs.userId, userId))
    //   .orderBy(desc(auditLogs.timestamp))
    //   .limit(limit);
    // return logs;
    
    return [];
  } catch (error) {
    console.error('[AuditLog] Failed to get user audit logs:', error);
    return [];
  }
}

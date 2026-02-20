import { getDb } from "./db";
import { auditLogs, type InsertAuditLog } from "../drizzle/schema";
import type { Request } from "express";

/**
 * AUDIT LOGGING SYSTEM
 * Enterprise-grade audit trail for compliance and fraud detection
 * Logs all critical operations: orders, payments, profile changes, product CRUD
 */

export interface AuditLogOptions {
  userId?: number;
  action: string; // e.g., "order.created", "profile.updated", "payment.completed"
  entityType: string; // e.g., "order", "product", "user", "payment"
  entityId?: number;
  changes?: Record<string, any>; // Before/after values for updates
  metadata?: Record<string, any>; // Additional context
  req?: Request; // Express request for IP/user agent
}

/**
 * Log an audit event
 * Used by all critical operations to maintain compliance trail
 */
export async function logAudit(options: AuditLogOptions): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available, skipping audit log");
    return;
  }

  try {
    const logEntry: InsertAuditLog = {
      userId: options.userId,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      changes: options.changes,
      metadata: options.metadata,
      ipAddress: options.req?.ip || options.req?.headers['x-forwarded-for'] as string,
      userAgent: options.req?.headers['user-agent'],
    };

    await db.insert(auditLogs).values(logEntry);
  } catch (error) {
    // Never let audit logging break the main operation
    console.error("[Audit] Failed to log audit event:", error);
  }
}

/**
 * Get audit logs for a specific user
 * Used by admin dashboard and compliance reports
 */
export async function getAuditLogsByUser(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return logs;
}

/**
 * Get audit logs for a specific entity
 * Used to track history of orders, products, etc.
 */
export async function getAuditLogsByEntity(
  entityType: string,
  entityId: number,
  limit: number = 100
) {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(auditLogs)
    .where(and(
      eq(auditLogs.entityType, entityType),
      eq(auditLogs.entityId, entityId)
    ))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return logs;
}

/**
 * Get recent audit logs (admin view)
 * Used by admin dashboard for monitoring
 */
export async function getRecentAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return logs;
}

/**
 * Search audit logs by action pattern
 * Used for compliance audits and fraud detection
 */
export async function searchAuditLogs(actionPattern: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(auditLogs)
    .where(like(auditLogs.action, `%${actionPattern}%`))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return logs;
}

// Import missing Drizzle operators
import { eq, and, desc, like } from "drizzle-orm";

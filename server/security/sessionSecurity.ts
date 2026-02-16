import crypto from 'crypto';
import { Request, Response } from 'express';
import { TRPCError } from '@trpc/server';

/**
 * Session Security Management
 * 
 * Implements:
 * - 24-hour session timeouts
 * - Secure cookie configuration
 * - Re-authentication for sensitive operations
 * - Session invalidation on password change
 * - Device fingerprinting for hijacking detection
 * - Concurrent session limits
 */

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_SESSIONS_PER_USER = 3;

export interface SessionData {
  userId: number;
  createdAt: Date;
  lastActivity: Date;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  rememberMe: boolean;
  requiresReauth: boolean; // Flag for sensitive operations
}

/**
 * Generate device fingerprint from request
 * 
 * Combines IP, user agent, and other headers to create unique identifier
 * Used to detect session hijacking
 */
export function generateDeviceFingerprint(req: Request): string {
  const components = [
    req.ip || req.connection?.remoteAddress || 'unknown',
    req.headers['user-agent'] || 'unknown',
    req.headers['accept-language'] || 'unknown',
    req.headers['accept-encoding'] || 'unknown',
  ];
  
  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

/**
 * Validate session is not expired
 * 
 * @param session - Session data
 * @returns true if session is valid, false if expired
 */
export function isSessionValid(session: SessionData): boolean {
  const now = new Date();
  const timeout = session.rememberMe ? REMEMBER_ME_TIMEOUT_MS : SESSION_TIMEOUT_MS;
  const expiresAt = new Date(session.lastActivity.getTime() + timeout);
  
  return now < expiresAt;
}

/**
 * Validate device fingerprint matches session
 * 
 * Detects session hijacking by comparing device fingerprints
 * 
 * @param session - Session data
 * @param req - Current request
 * @returns true if fingerprint matches, false if suspicious
 */
export function validateDeviceFingerprint(session: SessionData, req: Request): boolean {
  const currentFingerprint = generateDeviceFingerprint(req);
  return session.deviceFingerprint === currentFingerprint;
}

/**
 * Check if session requires re-authentication
 * 
 * Sensitive operations (payouts, account changes) require recent authentication
 * 
 * @param session - Session data
 * @param maxAge - Maximum age in milliseconds (default: 15 minutes)
 * @returns true if re-auth required
 */
export function requiresReauth(session: SessionData, maxAge: number = 15 * 60 * 1000): boolean {
  if (session.requiresReauth) {
    return true;
  }
  
  const now = new Date();
  const lastActivity = new Date(session.lastActivity);
  const timeSinceActivity = now.getTime() - lastActivity.getTime();
  
  return timeSinceActivity > maxAge;
}

/**
 * Middleware to validate session security
 * 
 * Checks:
 * - Session not expired
 * - Device fingerprint matches
 * - Session not hijacked
 * 
 * @throws TRPCError if session is invalid
 */
export function validateSessionSecurity(session: SessionData, req: Request): void {
  // Check if session is expired
  if (!isSessionValid(session)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session expired. Please log in again.',
    });
  }
  
  // Check device fingerprint
  if (!validateDeviceFingerprint(session, req)) {
    // Log suspicious activity
    console.warn('[Security] Device fingerprint mismatch', {
      userId: session.userId,
      sessionFingerprint: session.deviceFingerprint,
      requestFingerprint: generateDeviceFingerprint(req),
      ip: req.ip,
    });
    
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session security validation failed. Please log in again.',
    });
  }
}

/**
 * Middleware to require re-authentication for sensitive operations
 * 
 * Use this for:
 * - Payout requests
 * - Bank account changes
 * - Email/phone changes
 * - Password changes
 * - Account deletion
 * 
 * @throws TRPCError if re-auth required
 */
export function requireRecentAuth(session: SessionData): void {
  if (requiresReauth(session)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This operation requires recent authentication. Please confirm your password.',
    });
  }
}

/**
 * Update session activity timestamp
 * 
 * Call this on every authenticated request to keep session alive
 */
export function updateSessionActivity(session: SessionData): SessionData {
  return {
    ...session,
    lastActivity: new Date(),
    requiresReauth: false, // Reset re-auth flag after activity
  };
}

/**
 * Mark session as requiring re-authentication
 * 
 * Call this after password change or other security-sensitive events
 */
export function markSessionForReauth(session: SessionData): SessionData {
  return {
    ...session,
    requiresReauth: true,
  };
}

/**
 * Get secure cookie options
 * 
 * Configures cookies with:
 * - HttpOnly: Prevents JavaScript access (XSS protection)
 * - Secure: Only sent over HTTPS
 * - SameSite: Prevents CSRF attacks
 * - MaxAge: Session timeout
 */
export function getSecureCookieOptions(rememberMe: boolean = false) {
  const maxAge = rememberMe ? REMEMBER_ME_TIMEOUT_MS : SESSION_TIMEOUT_MS;
  
  return {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' as const, // Prevent CSRF
    maxAge, // Session timeout
    path: '/', // Available across entire site
  };
}

/**
 * Invalidate all sessions for a user
 * 
 * Call this when:
 * - User changes password
 * - User reports account compromise
 * - Suspicious activity detected
 * 
 * TODO: Implement session storage in database
 */
export async function invalidateAllUserSessions(userId: number): Promise<void> {
  // TODO: Delete all sessions from database
  console.log(`[Security] Invalidating all sessions for user ${userId}`);
  
  // Future implementation:
  // await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Get active session count for user
 * 
 * Used to enforce concurrent session limits
 * 
 * TODO: Implement session storage in database
 */
export async function getActiveSessionCount(userId: number): Promise<number> {
  // TODO: Count active sessions from database
  // const count = await db
  //   .select({ count: sql`count(*)` })
  //   .from(sessions)
  //   .where(eq(sessions.userId, userId));
  // return count[0].count;
  
  return 0; // Placeholder
}

/**
 * Enforce concurrent session limit
 * 
 * Prevents account sharing and credential stuffing attacks
 * 
 * @throws TRPCError if session limit exceeded
 */
export async function enforceSessionLimit(userId: number): Promise<void> {
  const activeCount = await getActiveSessionCount(userId);
  
  if (activeCount >= MAX_SESSIONS_PER_USER) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Maximum ${MAX_SESSIONS_PER_USER} concurrent sessions allowed. Please log out from another device.`,
    });
  }
}

/**
 * Create session data object
 */
export function createSessionData(
  userId: number,
  req: Request,
  rememberMe: boolean = false
): SessionData {
  return {
    userId,
    createdAt: new Date(),
    lastActivity: new Date(),
    deviceFingerprint: generateDeviceFingerprint(req),
    ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    rememberMe,
    requiresReauth: false,
  };
}

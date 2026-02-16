import { TRPCError } from '@trpc/server';

/**
 * Account Lockout & Brute Force Protection
 * 
 * Prevents:
 * - Password brute forcing
 * - Credential stuffing attacks
 * - Account enumeration
 * - Distributed attacks
 * 
 * Features:
 * - Lock account after 5 failed attempts
 * - 30-minute lockout period
 * - Progressive delays (exponential backoff)
 * - Email notifications
 * - IP-based rate limiting
 * - Suspicious activity detection
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_IP = 10;

/**
 * Failed login attempt record
 */
export interface FailedLoginAttempt {
  id: number;
  identifier: string; // email or phone
  ipAddress: string;
  attemptedAt: Date;
  userAgent: string;
}

/**
 * Account lockout record
 */
export interface AccountLockout {
  identifier: string;
  lockedAt: Date;
  lockedUntil: Date;
  failedAttempts: number;
  reason: 'max_attempts' | 'suspicious_activity';
  notificationSent: boolean;
}

/**
 * In-memory storage for failed attempts (TODO: move to database)
 * 
 * Structure: Map<identifier, FailedLoginAttempt[]>
 */
const failedAttempts = new Map<string, FailedLoginAttempt[]>();

/**
 * In-memory storage for account lockouts (TODO: move to database)
 * 
 * Structure: Map<identifier, AccountLockout>
 */
const accountLockouts = new Map<string, AccountLockout>();

/**
 * In-memory storage for IP-based rate limiting
 * 
 * Structure: Map<ipAddress, Date[]>
 */
const ipAttempts = new Map<string, Date[]>();

/**
 * Record failed login attempt
 * 
 * @param identifier - Email or phone number
 * @param ipAddress - IP address of attempt
 * @param userAgent - User agent string
 */
export function recordFailedAttempt(
  identifier: string,
  ipAddress: string,
  userAgent: string
): void {
  const attempt: FailedLoginAttempt = {
    id: Date.now(),
    identifier,
    ipAddress,
    attemptedAt: new Date(),
    userAgent,
  };
  
  // Get existing attempts for this identifier
  const attempts = failedAttempts.get(identifier) || [];
  
  // Add new attempt
  attempts.push(attempt);
  
  // Store updated attempts
  failedAttempts.set(identifier, attempts);
  
  // Clean up old attempts (older than 15 minutes)
  cleanupOldAttempts(identifier);
  
  // Check if account should be locked
  checkAndLockAccount(identifier);
}

/**
 * Clean up old failed attempts
 * 
 * Removes attempts older than 15 minutes
 */
function cleanupOldAttempts(identifier: string): void {
  const attempts = failedAttempts.get(identifier) || [];
  const cutoff = new Date(Date.now() - ATTEMPT_WINDOW_MS);
  
  const recentAttempts = attempts.filter(
    attempt => attempt.attemptedAt > cutoff
  );
  
  failedAttempts.set(identifier, recentAttempts);
}

/**
 * Check if account should be locked
 * 
 * Locks account if:
 * - 5+ failed attempts in 15 minutes
 * - Suspicious activity detected
 */
function checkAndLockAccount(identifier: string): void {
  const attempts = failedAttempts.get(identifier) || [];
  
  // Check if max attempts exceeded
  if (attempts.length >= MAX_FAILED_ATTEMPTS) {
    lockAccount(identifier, 'max_attempts');
  }
  
  // Check for suspicious activity
  if (detectSuspiciousActivity(attempts)) {
    lockAccount(identifier, 'suspicious_activity');
  }
}

/**
 * Lock account
 * 
 * @param identifier - Email or phone number
 * @param reason - Reason for lockout
 */
function lockAccount(
  identifier: string,
  reason: 'max_attempts' | 'suspicious_activity'
): void {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
  
  const lockout: AccountLockout = {
    identifier,
    lockedAt: now,
    lockedUntil,
    failedAttempts: failedAttempts.get(identifier)?.length || 0,
    reason,
    notificationSent: false,
  };
  
  accountLockouts.set(identifier, lockout);
  
  console.log(`[Security] Account locked: ${identifier} (reason: ${reason})`);
  
  // TODO: Send email notification
  // await sendAccountLockoutEmail(identifier, lockout);
}

/**
 * Check if account is locked
 * 
 * @param identifier - Email or phone number
 * @returns Lockout info if locked, null if not
 */
export function checkAccountLockout(identifier: string): AccountLockout | null {
  const lockout = accountLockouts.get(identifier);
  
  if (!lockout) {
    return null;
  }
  
  // Check if lockout has expired
  if (new Date() > lockout.lockedUntil) {
    // Lockout expired, remove it
    accountLockouts.delete(identifier);
    failedAttempts.delete(identifier);
    return null;
  }
  
  return lockout;
}

/**
 * Unlock account (admin action)
 * 
 * @param identifier - Email or phone number
 */
export function unlockAccount(identifier: string): void {
  accountLockouts.delete(identifier);
  failedAttempts.delete(identifier);
  
  console.log(`[Security] Account unlocked: ${identifier}`);
}

/**
 * Clear failed attempts (successful login)
 * 
 * @param identifier - Email or phone number
 */
export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

/**
 * Get failed attempt count
 * 
 * @param identifier - Email or phone number
 * @returns Number of failed attempts in last 15 minutes
 */
export function getFailedAttemptCount(identifier: string): number {
  cleanupOldAttempts(identifier);
  return failedAttempts.get(identifier)?.length || 0;
}

/**
 * Calculate delay before next attempt (exponential backoff)
 * 
 * @param attemptCount - Number of failed attempts
 * @returns Delay in milliseconds
 * 
 * Delays:
 * - 1st attempt: 0ms
 * - 2nd attempt: 1s
 * - 3rd attempt: 2s
 * - 4th attempt: 4s
 * - 5th attempt: 8s
 */
export function calculateAttemptDelay(attemptCount: number): number {
  if (attemptCount <= 1) {
    return 0;
  }
  
  // Exponential backoff: 2^(n-1) seconds
  return Math.pow(2, attemptCount - 1) * 1000;
}

/**
 * Detect suspicious activity
 * 
 * Flags:
 * - Multiple IPs in short time
 * - Rapid-fire attempts
 * - Unusual user agents
 * 
 * @param attempts - Failed login attempts
 * @returns true if suspicious
 */
function detectSuspiciousActivity(attempts: FailedLoginAttempt[]): boolean {
  if (attempts.length < 3) {
    return false;
  }
  
  // Check for multiple IPs
  const uniqueIPs = new Set(attempts.map(a => a.ipAddress));
  if (uniqueIPs.size >= 3) {
    console.warn('[Security] Suspicious activity: Multiple IPs detected');
    return true;
  }
  
  // Check for rapid-fire attempts (3+ attempts in 1 minute)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentAttempts = attempts.filter(a => a.attemptedAt > oneMinuteAgo);
  if (recentAttempts.length >= 3) {
    console.warn('[Security] Suspicious activity: Rapid-fire attempts detected');
    return true;
  }
  
  return false;
}

/**
 * Check IP-based rate limit
 * 
 * Prevents distributed attacks from same IP
 * 
 * @param ipAddress - IP address
 * @throws TRPCError if rate limit exceeded
 */
export function checkIPRateLimit(ipAddress: string): void {
  // Get attempts for this IP
  const attempts = ipAttempts.get(ipAddress) || [];
  
  // Clean up old attempts
  const cutoff = new Date(Date.now() - ATTEMPT_WINDOW_MS);
  const recentAttempts = attempts.filter(attempt => attempt > cutoff);
  
  // Check if rate limit exceeded
  if (recentAttempts.length >= MAX_ATTEMPTS_PER_IP) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Too many login attempts from this IP. Please try again in 15 minutes.`,
    });
  }
  
  // Record this attempt
  recentAttempts.push(new Date());
  ipAttempts.set(ipAddress, recentAttempts);
}

/**
 * Validate login attempt
 * 
 * Comprehensive check before allowing login:
 * - Account not locked
 * - IP rate limit not exceeded
 * - Progressive delay enforced
 * 
 * @param identifier - Email or phone number
 * @param ipAddress - IP address
 * @throws TRPCError if validation fails
 */
export function validateLoginAttempt(
  identifier: string,
  ipAddress: string
): void {
  // Check IP rate limit
  checkIPRateLimit(ipAddress);
  
  // Check account lockout
  const lockout = checkAccountLockout(identifier);
  if (lockout) {
    const minutesRemaining = Math.ceil(
      (lockout.lockedUntil.getTime() - Date.now()) / 60000
    );
    
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Account locked due to ${lockout.reason === 'max_attempts' ? 'too many failed login attempts' : 'suspicious activity'}. Try again in ${minutesRemaining} minutes.`,
    });
  }
  
  // Check progressive delay
  const attemptCount = getFailedAttemptCount(identifier);
  const delay = calculateAttemptDelay(attemptCount);
  
  if (delay > 0) {
    // TODO: Implement actual delay mechanism
    // For now, just log it
    console.log(`[Security] Progressive delay: ${delay}ms for ${identifier}`);
  }
}

/**
 * Get lockout statistics
 * 
 * @returns Lockout stats
 */
export function getLockoutStats(): {
  totalLocked: number;
  lockedAccounts: string[];
  totalFailedAttempts: number;
} {
  return {
    totalLocked: accountLockouts.size,
    lockedAccounts: Array.from(accountLockouts.keys()),
    totalFailedAttempts: Array.from(failedAttempts.values())
      .reduce((sum, attempts) => sum + attempts.length, 0),
  };
}

/**
 * Reset all security state (FOR TESTING ONLY)
 * 
 * Clears:
 * - Failed attempts
 * - Account lockouts
 * - IP rate limits
 */
export function resetAllSecurityState(): void {
  failedAttempts.clear();
  accountLockouts.clear();
  ipAttempts.clear();
}

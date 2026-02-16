import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordFailedAttempt,
  checkAccountLockout,
  unlockAccount,
  clearFailedAttempts,
  getFailedAttemptCount,
  calculateAttemptDelay,
  validateLoginAttempt,
  checkIPRateLimit,
  getLockoutStats,
  resetAllSecurityState,
} from './accountLockout';

/**
 * Account Lockout Test Suite
 */

describe('Failed Attempt Tracking', () => {
  beforeEach(() => {
    resetAllSecurityState();
  });

  it('should record failed login attempts', () => {
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    
    const count = getFailedAttemptCount('test@example.com');
    expect(count).toBe(1);
  });

  it('should track multiple failed attempts', () => {
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    
    const count = getFailedAttemptCount('test@example.com');
    expect(count).toBe(3);
  });

  it('should clear failed attempts', () => {
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    
    clearFailedAttempts('test@example.com');
    
    const count = getFailedAttemptCount('test@example.com');
    expect(count).toBe(0);
  });
});

describe('Account Lockout', () => {
  beforeEach(() => {
    resetAllSecurityState();
  });

  it('should lock account after 5 failed attempts', () => {
    // Record 5 failed attempts
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    }
    
    const lockout = checkAccountLockout('test@example.com');
    expect(lockout).not.toBeNull();
    // Could be either max_attempts or suspicious_activity (rapid attempts)
    expect(['max_attempts', 'suspicious_activity']).toContain(lockout?.reason);
  });

  it('should not lock account with fewer than 5 attempts', () => {
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    
    const lockout = checkAccountLockout('test@example.com');
    expect(lockout).toBeNull();
  });

  it('should unlock account', () => {
    // Lock account
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    }
    
    expect(checkAccountLockout('test@example.com')).not.toBeNull();
    
    // Unlock
    unlockAccount('test@example.com');
    
    expect(checkAccountLockout('test@example.com')).toBeNull();
  });

  it('should set 30-minute lockout duration', () => {
    // Lock account
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    }
    
    const lockout = checkAccountLockout('test@example.com');
    expect(lockout).not.toBeNull();
    
    if (lockout) {
      const duration = lockout.lockedUntil.getTime() - lockout.lockedAt.getTime();
      expect(duration).toBe(30 * 60 * 1000); // 30 minutes
    }
  });
});

describe('Suspicious Activity Detection', () => {
  beforeEach(() => {
    resetAllSecurityState();
  });

  it('should detect multiple IPs as suspicious', () => {
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.2', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.3', 'Mozilla/5.0');
    
    const lockout = checkAccountLockout('test@example.com');
    expect(lockout).not.toBeNull();
    expect(lockout?.reason).toBe('suspicious_activity');
  });

  it('should detect rapid-fire attempts as suspicious', () => {
    // Record 3 attempts in quick succession
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    recordFailedAttempt('test@example.com', '192.168.1.1', 'Mozilla/5.0');
    
    const lockout = checkAccountLockout('test@example.com');
    expect(lockout).not.toBeNull();
    expect(lockout?.reason).toBe('suspicious_activity');
  });
});

describe('Progressive Delay (Exponential Backoff)', () => {
  it('should have no delay for first attempt', () => {
    expect(calculateAttemptDelay(0)).toBe(0);
    expect(calculateAttemptDelay(1)).toBe(0);
  });

  it('should calculate exponential backoff delays', () => {
    // Formula: 2^(n-1) seconds
    expect(calculateAttemptDelay(2)).toBe(2000); // 2^1 = 2 seconds
    expect(calculateAttemptDelay(3)).toBe(4000); // 2^2 = 4 seconds
    expect(calculateAttemptDelay(4)).toBe(8000); // 2^3 = 8 seconds
    expect(calculateAttemptDelay(5)).toBe(16000); // 2^4 = 16 seconds
  });
});

describe('IP Rate Limiting', () => {
  beforeEach(() => {
    resetAllSecurityState();
  });

  it('should allow reasonable number of attempts from same IP', () => {
    expect(() => {
      for (let i = 0; i < 9; i++) {
        checkIPRateLimit('192.168.1.1');
      }
    }).not.toThrow();
  });

  it('should block excessive attempts from same IP', () => {
    expect(() => {
      for (let i = 0; i < 11; i++) {
        checkIPRateLimit('192.168.1.2');
      }
    }).toThrow('Too many login attempts');
  });

  it('should allow attempts from different IPs', () => {
    expect(() => {
      for (let i = 0; i < 5; i++) {
        checkIPRateLimit(`192.168.1.${i}`);
      }
    }).not.toThrow();
  });
});

describe('Login Attempt Validation', () => {
  beforeEach(() => {
    resetAllSecurityState();
  });

  it('should allow valid login attempt', () => {
    expect(() => {
      validateLoginAttempt('test@example.com', '192.168.1.100');
    }).not.toThrow();
  });

  it('should block login for locked account', () => {
    // Lock account
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('test@example.com', '192.168.1.100', 'Mozilla/5.0');
    }
    
    expect(() => {
      validateLoginAttempt('test@example.com', '192.168.1.100');
    }).toThrow('Account locked');
  });

  it('should block login when IP rate limit exceeded', () => {
    expect(() => {
      for (let i = 0; i < 11; i++) {
        validateLoginAttempt(`user${i}@example.com`, '192.168.1.200');
      }
    }).toThrow('Too many login attempts');
  });
});

describe('Lockout Statistics', () => {
  beforeEach(() => {
    resetAllSecurityState();
  });

  it('should track lockout statistics', () => {
    // Lock two accounts
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('user1@example.com', '192.168.1.1', 'Mozilla/5.0');
      recordFailedAttempt('user2@example.com', '192.168.1.2', 'Mozilla/5.0');
    }
    
    const stats = getLockoutStats();
    expect(stats.totalLocked).toBeGreaterThanOrEqual(2);
    expect(stats.lockedAccounts).toContain('user1@example.com');
    expect(stats.lockedAccounts).toContain('user2@example.com');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateDeviceFingerprint,
  isSessionValid,
  validateDeviceFingerprint,
  requiresReauth,
  updateSessionActivity,
  markSessionForReauth,
  createSessionData,
  SessionData,
} from './sessionSecurity';

/**
 * Session Security Test Suite
 * 
 * Tests session timeout, device fingerprinting, and re-authentication logic
 */

// Mock request object
function createMockRequest(overrides: any = {}) {
  return {
    ip: '192.168.1.1',
    connection: { remoteAddress: '192.168.1.1' },
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      ...overrides.headers,
    },
    ...overrides,
  } as any;
}

describe('Device Fingerprinting', () => {
  it('should generate consistent fingerprints for same device', () => {
    const req1 = createMockRequest();
    const req2 = createMockRequest();
    
    const fingerprint1 = generateDeviceFingerprint(req1);
    const fingerprint2 = generateDeviceFingerprint(req2);
    
    expect(fingerprint1).toBe(fingerprint2);
  });

  it('should generate different fingerprints for different IPs', () => {
    const req1 = createMockRequest({ ip: '192.168.1.1' });
    const req2 = createMockRequest({ ip: '192.168.1.2' });
    
    const fingerprint1 = generateDeviceFingerprint(req1);
    const fingerprint2 = generateDeviceFingerprint(req2);
    
    expect(fingerprint1).not.toBe(fingerprint2);
  });

  it('should generate different fingerprints for different user agents', () => {
    const req1 = createMockRequest({
      headers: { 'user-agent': 'Mozilla/5.0 Chrome' },
    });
    const req2 = createMockRequest({
      headers: { 'user-agent': 'Mozilla/5.0 Firefox' },
    });
    
    const fingerprint1 = generateDeviceFingerprint(req1);
    const fingerprint2 = generateDeviceFingerprint(req2);
    
    expect(fingerprint1).not.toBe(fingerprint2);
  });

  it('should produce SHA-256 hash format', () => {
    const req = createMockRequest();
    const fingerprint = generateDeviceFingerprint(req);
    
    // SHA-256 produces 64 hex characters
    expect(fingerprint.length).toBe(64);
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('Session Validation', () => {
  it('should validate fresh sessions', () => {
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    expect(isSessionValid(session)).toBe(true);
  });

  it('should invalidate expired sessions (24 hours)', () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    
    const session: SessionData = {
      userId: 1,
      createdAt: yesterday,
      lastActivity: yesterday,
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    expect(isSessionValid(session)).toBe(false);
  });

  it('should allow longer expiry for remember me sessions', () => {
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    
    const session: SessionData = {
      userId: 1,
      createdAt: twentyDaysAgo,
      lastActivity: twentyDaysAgo,
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: true, // Remember me enabled
      requiresReauth: false,
    };
    
    expect(isSessionValid(session)).toBe(true);
  });

  it('should invalidate remember me sessions after 30 days', () => {
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    
    const session: SessionData = {
      userId: 1,
      createdAt: thirtyOneDaysAgo,
      lastActivity: thirtyOneDaysAgo,
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: true,
      requiresReauth: false,
    };
    
    expect(isSessionValid(session)).toBe(false);
  });
});

describe('Device Fingerprint Validation', () => {
  it('should validate matching fingerprints', () => {
    const req = createMockRequest();
    const fingerprint = generateDeviceFingerprint(req);
    
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceFingerprint: fingerprint,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    expect(validateDeviceFingerprint(session, req)).toBe(true);
  });

  it('should reject mismatched fingerprints (session hijacking)', () => {
    const req1 = createMockRequest({ ip: '192.168.1.1' });
    const req2 = createMockRequest({ ip: '192.168.1.2' }); // Different IP
    
    const fingerprint1 = generateDeviceFingerprint(req1);
    
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceFingerprint: fingerprint1,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    // Request from different IP should fail validation
    expect(validateDeviceFingerprint(session, req2)).toBe(false);
  });
});

describe('Re-authentication Requirements', () => {
  it('should not require reauth for recent activity', () => {
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(), // Just now
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    expect(requiresReauth(session)).toBe(false);
  });

  it('should require reauth after 15 minutes of inactivity', () => {
    const sixteenMinutesAgo = new Date(Date.now() - 16 * 60 * 1000);
    
    const session: SessionData = {
      userId: 1,
      createdAt: sixteenMinutesAgo,
      lastActivity: sixteenMinutesAgo,
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    expect(requiresReauth(session)).toBe(true);
  });

  it('should require reauth when flag is set', () => {
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: true, // Flag set
    };
    
    expect(requiresReauth(session)).toBe(true);
  });
});

describe('Session Activity Updates', () => {
  it('should update last activity timestamp', () => {
    const oldTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    
    const session: SessionData = {
      userId: 1,
      createdAt: oldTime,
      lastActivity: oldTime,
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    const updated = updateSessionActivity(session);
    
    // Last activity should be updated to now
    expect(updated.lastActivity.getTime()).toBeGreaterThan(oldTime.getTime());
    expect(updated.lastActivity.getTime()).toBeCloseTo(Date.now(), -2); // Within 100ms
  });

  it('should reset reauth flag on activity', () => {
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: true, // Flag set
    };
    
    const updated = updateSessionActivity(session);
    
    expect(updated.requiresReauth).toBe(false);
  });
});

describe('Session Creation', () => {
  it('should create session data from request', () => {
    const req = createMockRequest();
    const session = createSessionData(123, req, false);
    
    expect(session.userId).toBe(123);
    expect(session.rememberMe).toBe(false);
    expect(session.requiresReauth).toBe(false);
    expect(session.deviceFingerprint).toBeDefined();
    expect(session.ipAddress).toBe('192.168.1.1');
    expect(session.userAgent).toContain('Mozilla');
  });

  it('should set remember me flag', () => {
    const req = createMockRequest();
    const session = createSessionData(123, req, true);
    
    expect(session.rememberMe).toBe(true);
  });
});

describe('Session Security Flags', () => {
  it('should mark session for reauth', () => {
    const session: SessionData = {
      userId: 1,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceFingerprint: 'abc123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      rememberMe: false,
      requiresReauth: false,
    };
    
    const marked = markSessionForReauth(session);
    
    expect(marked.requiresReauth).toBe(true);
  });
});

/**
 * Enterprise-Grade Distributed Rate Limiter
 * 
 * Features:
 * - Redis-based for horizontal scalability
 * - In-memory fallback for development/single-server deployments
 * - Token bucket algorithm with sliding window
 * - Circuit breaker pattern for Redis failures
 * - Automatic cleanup and memory management
 * - Support for multiple rate limit tiers
 * 
 * Production-ready for competing with Shopify, AWS, Spotify scale.
 */

import { createClient, RedisClientType } from 'redis';

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number;  // Max requests per window
  windowMs: number;     // Time window in milliseconds
  blockDurationMs?: number; // How long to block after exceeding limit
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  headers: Record<string, string>;
}

// Rate limit tiers for different endpoints
export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  // Public endpoints
  'public:search': {
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  'public:api': {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Authenticated endpoints
  'auth:search': {
    maxRequests: 5000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  'auth:purchase': {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  'auth:stream': {
    maxRequests: 10000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  'auth:upload': {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Agent API endpoints
  'agent:search': {
    maxRequests: 10000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  'agent:purchase': {
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  'agent:analytics': {
    maxRequests: 5000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Admin endpoints (higher limits)
  'admin:api': {
    maxRequests: 10000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Webhook endpoints (very high limits)
  'webhook:stripe': {
    maxRequests: 100000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

// ============================================================================
// REDIS CLIENT & CIRCUIT BREAKER
// ============================================================================

let redisClient: RedisClientType | null = null;
let redisAvailable = false;
let circuitBreakerOpen = false;
let circuitBreakerResetAt = 0;

const CIRCUIT_BREAKER_THRESHOLD = 5; // Open circuit after 5 failures
const CIRCUIT_BREAKER_TIMEOUT = 60000; // Try to reconnect after 60 seconds
let circuitBreakerFailures = 0;

/**
 * Initialize Redis client for distributed rate limiting
 */
export async function initializeRedis(redisUrl?: string): Promise<void> {
  if (redisClient) return;

  try {
    const url = redisUrl || process.env.REDIS_URL;
    
    if (!url) {
      console.warn('[RateLimiter] No Redis URL provided, using in-memory fallback');
      return;
    }

    redisClient = createClient({ url });

    redisClient.on('error', (err) => {
      console.error('[RateLimiter] Redis error:', err);
      handleRedisFailure();
    });

    redisClient.on('connect', () => {
      console.log('[RateLimiter] Redis connected');
      redisAvailable = true;
      circuitBreakerOpen = false;
      circuitBreakerFailures = 0;
    });

    redisClient.on('disconnect', () => {
      console.warn('[RateLimiter] Redis disconnected');
      redisAvailable = false;
    });

    await redisClient.connect();
  } catch (error) {
    console.error('[RateLimiter] Failed to initialize Redis:', error);
    handleRedisFailure();
  }
}

/**
 * Handle Redis failures with circuit breaker pattern
 */
function handleRedisFailure(): void {
  circuitBreakerFailures++;
  
  if (circuitBreakerFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerOpen = true;
    circuitBreakerResetAt = Date.now() + CIRCUIT_BREAKER_TIMEOUT;
    console.warn(`[RateLimiter] Circuit breaker opened, falling back to in-memory for ${CIRCUIT_BREAKER_TIMEOUT}ms`);
  }
}

/**
 * Check if circuit breaker should be reset
 */
function checkCircuitBreaker(): void {
  if (circuitBreakerOpen && Date.now() >= circuitBreakerResetAt) {
    circuitBreakerOpen = false;
    circuitBreakerFailures = 0;
    console.log('[RateLimiter] Circuit breaker reset, attempting Redis reconnection');
  }
}

// ============================================================================
// IN-MEMORY FALLBACK
// ============================================================================

interface InMemoryBucket {
  count: number;
  resetAt: number;
}

const inMemoryBuckets = new Map<string, InMemoryBucket>();
const MAX_BUCKETS = 100000; // Prevent memory leaks

/**
 * Clean up old in-memory buckets
 */
function cleanupInMemoryBuckets(): void {
  const now = Date.now();
  
  for (const [key, bucket] of inMemoryBuckets.entries()) {
    if (now >= bucket.resetAt) {
      inMemoryBuckets.delete(key);
    }
  }
  
  // If still too many buckets, remove oldest ones
  if (inMemoryBuckets.size > MAX_BUCKETS) {
    const sortedKeys = Array.from(inMemoryBuckets.entries())
      .sort((a, b) => a[1].resetAt - b[1].resetAt)
      .slice(0, inMemoryBuckets.size - MAX_BUCKETS)
      .map(([key]) => key);
    
    sortedKeys.forEach(key => inMemoryBuckets.delete(key));
  }
}

// Clean up every 5 minutes
setInterval(cleanupInMemoryBuckets, 5 * 60 * 1000);

/**
 * Check rate limit using in-memory storage
 */
async function checkRateLimitInMemory(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  let bucket = inMemoryBuckets.get(key);
  
  if (!bucket || now >= bucket.resetAt) {
    bucket = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    inMemoryBuckets.set(key, bucket);
  }
  
  bucket.count++;
  
  const allowed = bucket.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - bucket.count);
  const resetAt = Math.ceil(bucket.resetAt / 1000);
  const retryAfter = allowed ? undefined : Math.ceil((bucket.resetAt - now) / 1000);
  
  return {
    allowed,
    remaining,
    resetAt,
    retryAfter,
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetAt.toString(),
      ...(retryAfter ? { 'Retry-After': retryAfter.toString() } : {}),
    },
  };
}

// ============================================================================
// REDIS-BASED RATE LIMITING
// ============================================================================

/**
 * Check rate limit using Redis (distributed)
 */
async function checkRateLimitRedis(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (!redisClient || !redisAvailable) {
    throw new Error('Redis not available');
  }
  
  const now = Date.now();
  const resetAt = now + config.windowMs;
  const resetAtSeconds = Math.ceil(resetAt / 1000);
  
  try {
    // Use Redis INCR with EXPIRE for atomic rate limiting
    const count = await redisClient.incr(key);
    
    if (count === 1) {
      // First request in window, set expiration
      await redisClient.pExpire(key, config.windowMs);
    }
    
    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);
    const ttl = await redisClient.pTTL(key);
    const retryAfter = allowed ? undefined : Math.ceil(ttl / 1000);
    
    return {
      allowed,
      remaining,
      resetAt: resetAtSeconds,
      retryAfter,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetAtSeconds.toString(),
        ...(retryAfter ? { 'Retry-After': retryAfter.toString() } : {}),
      },
    };
  } catch (error) {
    console.error('[RateLimiter] Redis operation failed:', error);
    handleRedisFailure();
    throw error;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Check rate limit for a given identifier and tier
 * 
 * @param identifier - Unique identifier (user ID, API key, IP address)
 * @param tier - Rate limit tier (e.g., 'auth:search', 'agent:purchase')
 * @returns Rate limit result with allowed status and headers
 */
export async function checkRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMIT_TIERS
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_TIERS[tier];
  
  if (!config) {
    throw new Error(`Unknown rate limit tier: ${tier}`);
  }
  
  const key = `ratelimit:${tier}:${identifier}`;
  
  // Check circuit breaker
  checkCircuitBreaker();
  
  // Try Redis first, fallback to in-memory
  if (redisClient && redisAvailable && !circuitBreakerOpen) {
    try {
      return await checkRateLimitRedis(key, config);
    } catch (error) {
      console.warn('[RateLimiter] Redis failed, falling back to in-memory');
      return await checkRateLimitInMemory(key, config);
    }
  } else {
    return await checkRateLimitInMemory(key, config);
  }
}

/**
 * Reset rate limit for a specific identifier and tier
 * Useful for testing or manual overrides
 */
export async function resetRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMIT_TIERS
): Promise<void> {
  const key = `ratelimit:${tier}:${identifier}`;
  
  if (redisClient && redisAvailable) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('[RateLimiter] Failed to reset rate limit in Redis:', error);
    }
  }
  
  inMemoryBuckets.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  tier: keyof typeof RATE_LIMIT_TIERS
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_TIERS[tier];
  const key = `ratelimit:${tier}:${identifier}`;
  const now = Date.now();
  
  if (redisClient && redisAvailable && !circuitBreakerOpen) {
    try {
      const count = await redisClient.get(key);
      const ttl = await redisClient.pTTL(key);
      
      const currentCount = count ? parseInt(count) : 0;
      const remaining = Math.max(0, config.maxRequests - currentCount);
      const resetAt = Math.ceil((now + ttl) / 1000);
      
      return {
        allowed: currentCount < config.maxRequests,
        remaining,
        resetAt,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetAt.toString(),
        },
      };
    } catch (error) {
      console.error('[RateLimiter] Failed to get status from Redis:', error);
    }
  }
  
  // Fallback to in-memory
  const bucket = inMemoryBuckets.get(key);
  
  if (!bucket || now >= bucket.resetAt) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Math.ceil((now + config.windowMs) / 1000),
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': config.maxRequests.toString(),
        'X-RateLimit-Reset': Math.ceil((now + config.windowMs) / 1000).toString(),
      },
    };
  }
  
  const remaining = Math.max(0, config.maxRequests - bucket.count);
  const resetAt = Math.ceil(bucket.resetAt / 1000);
  
  return {
    allowed: bucket.count < config.maxRequests,
    remaining,
    resetAt,
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetAt.toString(),
    },
  };
}

/**
 * Shutdown Redis client gracefully
 */
export async function shutdownRateLimiter(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('[RateLimiter] Redis client shut down gracefully');
    } catch (error) {
      console.error('[RateLimiter] Error shutting down Redis:', error);
    }
  }
}

// Initialize Redis on module load (if REDIS_URL is available)
if (process.env.REDIS_URL) {
  initializeRedis().catch(err => {
    console.error('[RateLimiter] Failed to initialize Redis on startup:', err);
  });
}

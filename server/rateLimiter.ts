/**
 * Rate Limiting Middleware for Agent API
 * 
 * Implements token bucket algorithm to prevent API abuse.
 * 
 * Tiers:
 * - Search: 1000 requests/hour
 * - Purchase: 100 requests/hour
 * - Stream: 10000 requests/hour
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitBucket>();

export interface RateLimitConfig {
  maxTokens: number; // Max requests per hour
  refillRate: number; // Tokens added per second
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  search: {
    maxTokens: 1000,
    refillRate: 1000 / 3600, // 1000 per hour = ~0.278 per second
  },
  purchase: {
    maxTokens: 100,
    refillRate: 100 / 3600, // 100 per hour = ~0.028 per second
  },
  stream: {
    maxTokens: 10000,
    refillRate: 10000 / 3600, // 10000 per hour = ~2.778 per second
  },
  analytics: {
    maxTokens: 500,
    refillRate: 500 / 3600, // 500 per hour = ~0.139 per second
  },
};

/**
 * Check if a request is allowed under rate limits
 * 
 * @param clientId - Unique identifier for the client (e.g., API key, user ID)
 * @param endpoint - Endpoint name (search, purchase, stream, analytics)
 * @returns Object with allowed status and rate limit headers
 */
export function checkRateLimit(
  clientId: string,
  endpoint: keyof typeof RATE_LIMITS
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  headers: Record<string, string>;
} {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  const bucketKey = `${clientId}:${endpoint}`;
  const now = Date.now() / 1000; // Current time in seconds

  // Get or create bucket
  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = {
      tokens: config.maxTokens,
      lastRefill: now,
    };
    buckets.set(bucketKey, bucket);
  }

  // Refill tokens based on time elapsed
  const timeSinceLastRefill = now - bucket.lastRefill;
  const tokensToAdd = timeSinceLastRefill * config.refillRate;
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Check if request is allowed
  const allowed = bucket.tokens >= 1;
  if (allowed) {
    bucket.tokens -= 1;
  }

  // Calculate reset time (when bucket will be full again)
  const tokensNeeded = config.maxTokens - bucket.tokens;
  const secondsUntilFull = tokensNeeded / config.refillRate;
  const resetAt = Math.ceil(now + secondsUntilFull);

  // Rate limit headers (following RFC 6585)
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": config.maxTokens.toString(),
    "X-RateLimit-Remaining": Math.floor(bucket.tokens).toString(),
    "X-RateLimit-Reset": resetAt.toString(),
  };

  if (!allowed) {
    headers["Retry-After"] = Math.ceil(1 / config.refillRate).toString();
  }

  return {
    allowed,
    remaining: Math.floor(bucket.tokens),
    resetAt,
    headers,
  };
}

/**
 * Clean up old buckets to prevent memory leaks
 * 
 * Run this periodically (e.g., every hour) to remove inactive buckets.
 */
export function cleanupBuckets(): void {
  const now = Date.now() / 1000;
  const maxAge = 3600; // 1 hour

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(key);
    }
  }
}

// Clean up buckets every hour
setInterval(cleanupBuckets, 3600 * 1000);

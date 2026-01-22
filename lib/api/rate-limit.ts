/**
 * Rate limiting module with support for both in-memory (development) and Redis (production) storage.
 *
 * For production multi-instance deployments:
 * - Set REDIS_URL environment variable to enable Redis-based rate limiting
 * - Example: REDIS_URL=redis://localhost:6379
 *
 * Without Redis, falls back to in-memory storage (suitable for single-instance or development)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

// Maximum entries before forcing cleanup (in-memory only)
const MAX_ENTRIES = 10000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Abstract rate limit store interface for different backends
 */
interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  cleanup?(): Promise<void>;
}

/**
 * In-memory rate limit store (for development/single instance)
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  async get(key: string): Promise<RateLimitEntry | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    // Cleanup if map is too large
    if (this.store.size > MAX_ENTRIES) {
      await this.cleanup();
    }
    this.store.set(key, entry);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Redis-based rate limit store (for production/multi-instance)
 * Uses ioredis if available
 */
class RedisRateLimitStore implements RateLimitStore {
  private redis: any;

  constructor(redisUrl: string) {
    // Dynamic import to avoid errors when Redis is not installed
    try {
      const Redis = require("ioredis");

      this.redis = new Redis(redisUrl);
    } catch {
      console.warn(
        "ioredis not installed, falling back to in-memory rate limiting",
      );
      throw new Error("Redis not available");
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const data = await this.redis.get(`ratelimit:${key}`);

    if (!data) return null;

    return JSON.parse(data);
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    await this.redis.set(
      `ratelimit:${key}`,
      JSON.stringify(entry),
      "PX",
      ttlMs,
    );
  }
}

/**
 * Get the appropriate rate limit store based on environment
 */
function getRateLimitStore(): RateLimitStore {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      return new RedisRateLimitStore(redisUrl);
    } catch {
      // Fall through to in-memory
    }
  }

  return new InMemoryRateLimitStore();
}

// Singleton store instance
let store: RateLimitStore | null = null;

function getStore(): RateLimitStore {
  if (!store) {
    store = getRateLimitStore();
  }

  return store;
}

/**
 * Check if a request is allowed based on rate limiting
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and remaining requests
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: Partial<RateLimitConfig> = {},
): Promise<RateLimitResult> {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };
  const now = Date.now();
  const rateLimitStore = getStore();

  // Random cleanup for in-memory store
  if (Math.random() < 0.05 && rateLimitStore.cleanup) {
    await rateLimitStore.cleanup();
  }

  const entry = await rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const resetTime = now + windowMs;

    await rateLimitStore.set(identifier, { count: 1, resetTime }, windowMs);

    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  await rateLimitStore.set(identifier, entry, entry.resetTime - now);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Synchronous rate limit check (uses in-memory only, for backwards compatibility)
 * For production with Redis, use checkRateLimitAsync instead
 */
const syncStore = new InMemoryRateLimitStore();

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {},
): RateLimitResult {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };
  const now = Date.now();

  // Synchronous access for backwards compatibility
  const entry = (syncStore as any).store.get(identifier) as
    | RateLimitEntry
    | undefined;

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;

    (syncStore as any).store.set(identifier, { count: 1, resetTime });

    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Falls back to a combination of headers if IP is not available
 */
export function getClientIdentifier(request: Request): string {
  const headers = request.headers;

  // Try to get real IP from various headers (common for proxies)
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  // Fallback: use user agent + accept-language as pseudo-identifier
  const userAgent = headers.get("user-agent") || "unknown";
  const acceptLanguage = headers.get("accept-language") || "unknown";

  return `${userAgent}-${acceptLanguage}`.substring(0, 100);
}

/**
 * Rate limit presets for different API types
 */
export const rateLimitPresets = {
  // Standard API endpoints
  standard: { windowMs: 60 * 1000, maxRequests: 100 },

  // Auth endpoints (stricter)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },

  // Write operations
  write: { windowMs: 60 * 1000, maxRequests: 30 },

  // Public read endpoints (more lenient)
  publicRead: { windowMs: 60 * 1000, maxRequests: 200 },

  // Admin operations
  admin: { windowMs: 60 * 1000, maxRequests: 50 },
};

/**
 * Create a rate limit error response
 */
export function rateLimitExceededResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
      },
    },
  );
}

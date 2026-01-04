// Simple in-memory rate limiting for API routes
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Maximum requests per window
}

const defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000,   // 1 minute
    maxRequests: 100,      // 100 requests per minute
};

// Maximum entries before forcing cleanup
const MAX_ENTRIES = 10000;

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if a request is allowed based on rate limiting
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
): RateLimitResult {
    const { windowMs, maxRequests } = { ...defaultConfig, ...config };
    const now = Date.now();

    // Clean up expired entries more frequently (5% of requests) or when map is too large
    if (Math.random() < 0.05 || rateLimitStore.size > MAX_ENTRIES) {
        cleanupExpiredEntries(now);
    }

    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        // Create new entry
        const resetTime = now + windowMs;
        rateLimitStore.set(identifier, { count: 1, resetTime });
        return { allowed: true, remaining: maxRequests - 1, resetTime };
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(identifier, entry);

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
 * Cleanup expired entries from the store
 */
function cleanupExpiredEntries(now: number): void {
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
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
        }
    );
}

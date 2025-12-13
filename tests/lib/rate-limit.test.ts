import { describe, it, expect } from "vitest";
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit";

describe("Rate Limiting", () => {
    describe("checkRateLimit", () => {
        it("should allow first request", () => {
            const result = checkRateLimit("test-user-1", { maxRequests: 5 });
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it("should decrement remaining count on subsequent requests", () => {
            const identifier = "test-user-2";
            const config = { maxRequests: 5, windowMs: 60000 };

            const first = checkRateLimit(identifier, config);
            expect(first.remaining).toBe(4);

            const second = checkRateLimit(identifier, config);
            expect(second.remaining).toBe(3);

            const third = checkRateLimit(identifier, config);
            expect(third.remaining).toBe(2);
        });

        it("should block requests after limit reached", () => {
            const identifier = "test-user-3";
            const config = { maxRequests: 2, windowMs: 60000 };

            checkRateLimit(identifier, config);
            checkRateLimit(identifier, config);

            const blocked = checkRateLimit(identifier, config);
            expect(blocked.allowed).toBe(false);
            expect(blocked.remaining).toBe(0);
        });

        it("should reset after window expires", async () => {
            const identifier = "test-user-4";
            const config = { maxRequests: 1, windowMs: 50 }; // 50ms window

            const first = checkRateLimit(identifier, config);
            expect(first.allowed).toBe(true);

            const blocked = checkRateLimit(identifier, config);
            expect(blocked.allowed).toBe(false);

            // Wait for window to expire
            await new Promise(resolve => setTimeout(resolve, 60));

            const afterReset = checkRateLimit(identifier, config);
            expect(afterReset.allowed).toBe(true);
        });
    });

    describe("rateLimitPresets", () => {
        it("should have correct config for auth endpoints", () => {
            expect(rateLimitPresets.auth.maxRequests).toBe(10);
            expect(rateLimitPresets.auth.windowMs).toBe(15 * 60 * 1000); // 15 minutes
        });

        it("should have correct config for standard endpoints", () => {
            expect(rateLimitPresets.standard.maxRequests).toBe(100);
            expect(rateLimitPresets.standard.windowMs).toBe(60 * 1000); // 1 minute
        });
    });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Tests for the Reviews API validation and business logic
 * These tests verify the validation schema and error handling
 */

// Validation schema (same as in route.ts)
const createReviewSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    rating: z.number().int().min(1).max(5, "Product rating must be 1-5"),
    shippingRating: z.number().int().min(1).max(5, "Shipping rating must be 1-5"),
    comment: z.string().max(2000).optional(),
});

describe("Reviews API", () => {
    describe("Input Validation Schema", () => {
        it("should require orderId", () => {
            const result = createReviewSchema.safeParse({
                rating: 5,
                shippingRating: 5,
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain("orderId");
            }
        });

        it("should reject empty orderId", () => {
            const result = createReviewSchema.safeParse({
                orderId: "",
                rating: 5,
                shippingRating: 5,
            });
            expect(result.success).toBe(false);
        });

        it("should require rating", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                shippingRating: 5,
            });
            expect(result.success).toBe(false);
        });

        it("should reject rating less than 1", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 0,
                shippingRating: 5,
            });
            expect(result.success).toBe(false);
        });

        it("should reject rating greater than 5", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 6,
                shippingRating: 5,
            });
            expect(result.success).toBe(false);
        });

        it("should require shippingRating", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
            });
            expect(result.success).toBe(false);
        });

        it("should reject shippingRating less than 1", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
                shippingRating: 0,
            });
            expect(result.success).toBe(false);
        });

        it("should reject shippingRating greater than 5", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
                shippingRating: 6,
            });
            expect(result.success).toBe(false);
        });

        it("should accept valid input without comment", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
                shippingRating: 4,
            });
            expect(result.success).toBe(true);
        });

        it("should accept valid input with comment", () => {
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
                shippingRating: 4,
                comment: "Great product!",
            });
            expect(result.success).toBe(true);
        });

        it("should reject comment longer than 2000 characters", () => {
            const longComment = "a".repeat(2001);
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
                shippingRating: 5,
                comment: longComment,
            });
            expect(result.success).toBe(false);
        });

        it("should accept comment exactly 2000 characters", () => {
            const maxComment = "a".repeat(2000);
            const result = createReviewSchema.safeParse({
                orderId: "order-123",
                rating: 5,
                shippingRating: 5,
                comment: maxComment,
            });
            expect(result.success).toBe(true);
        });
    });

    describe("Business Logic Helpers", () => {
        // Helper to check if order can be reviewed
        const canReviewOrder = (order: {
            status: string;
            userId: string;
            reviews: unknown[];
        }, userId: string) => {
            if (order.userId !== userId) return { error: "Not owner", code: 403 };
            if (order.status !== "DELIVERED") return { error: "Not delivered", code: 400 };
            if (order.reviews.length > 0) return { error: "Already reviewed", code: 400 };
            return { success: true };
        };

        it("should allow owner to review delivered order", () => {
            const result = canReviewOrder({
                status: "DELIVERED",
                userId: "user-123",
                reviews: [],
            }, "user-123");
            expect(result.success).toBe(true);
        });

        it("should reject review from non-owner", () => {
            const result = canReviewOrder({
                status: "DELIVERED",
                userId: "user-123",
                reviews: [],
            }, "other-user");
            expect(result.error).toBe("Not owner");
            expect(result.code).toBe(403);
        });

        it("should reject review of non-delivered order", () => {
            const result = canReviewOrder({
                status: "PROCESSING",
                userId: "user-123",
                reviews: [],
            }, "user-123");
            expect(result.error).toBe("Not delivered");
            expect(result.code).toBe(400);
        });

        it("should reject review of already reviewed order", () => {
            const result = canReviewOrder({
                status: "DELIVERED",
                userId: "user-123",
                reviews: [{ id: "review-1" }],
            }, "user-123");
            expect(result.error).toBe("Already reviewed");
            expect(result.code).toBe(400);
        });
    });

    describe("Product Deduplication Logic", () => {
        // Helper to get unique products to review
        const getProductsToReview = (
            orderItems: { productId: string }[],
            existingReviews: { productId: string }[]
        ) => {
            const uniqueProductIds = [...new Set(orderItems.map((item) => item.productId))];
            const reviewedProductIds = new Set(existingReviews.map((r) => r.productId));
            return uniqueProductIds.filter((id) => !reviewedProductIds.has(id));
        };

        it("should deduplicate products in order", () => {
            const result = getProductsToReview(
                [
                    { productId: "prod-1" },
                    { productId: "prod-1" }, // Duplicate
                    { productId: "prod-2" },
                ],
                []
            );
            expect(result).toEqual(["prod-1", "prod-2"]);
        });

        it("should exclude already reviewed products", () => {
            const result = getProductsToReview(
                [
                    { productId: "prod-1" },
                    { productId: "prod-2" },
                    { productId: "prod-3" },
                ],
                [{ productId: "prod-1" }]
            );
            expect(result).toEqual(["prod-2", "prod-3"]);
        });

        it("should return empty array when all products reviewed", () => {
            const result = getProductsToReview(
                [
                    { productId: "prod-1" },
                    { productId: "prod-2" },
                ],
                [
                    { productId: "prod-1" },
                    { productId: "prod-2" },
                ]
            );
            expect(result).toEqual([]);
        });

        it("should handle empty order items", () => {
            const result = getProductsToReview([], []);
            expect(result).toEqual([]);
        });
    });
});

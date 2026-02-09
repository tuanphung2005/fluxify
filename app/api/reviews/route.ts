import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";
import { isErrorResult } from "@/lib/api/responses";
import { updateProductRating } from "@/lib/db/ecommerce-queries";

// Validation schema for creating a review
const createReviewSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    rating: z.number().int().min(1).max(5, "Product rating must be 1-5"),
    shippingRating: z.number().int().min(1).max(5, "Shipping rating must be 1-5"),
    comment: z.string().max(2000).optional(),
});

/**
 * POST /api/reviews - Create reviews for all products in an order
 */
export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const authResult = await getAuthenticatedUser();
        if (isErrorResult(authResult)) {
            return errorResponse(authResult.error, authResult.status);
        }
        const { user } = authResult;

        // Parse and validate body
        const body = await req.json();
        const validation = createReviewSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }
        const { orderId, rating, shippingRating, comment } = validation.data;

        // Get order with items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                reviews: true,
            },
        });

        if (!order) {
            return errorResponse("Không tìm thấy đơn hàng", 404);
        }

        // Verify order belongs to user
        if (order.userId !== user.id) {
            return errorResponse("Bạn không thể đánh giá đơn hàng này", 403);
        }

        // Verify order is delivered
        if (order.status !== "DELIVERED") {
            return errorResponse("Chỉ có thể đánh giá đơn hàng đã giao", 400);
        }

        // Check if already reviewed
        if (order.reviews.length > 0) {
            return errorResponse("Bạn đã đánh giá đơn hàng này rồi", 400);
        }

        // Get unique product IDs from order items (avoid duplicates)
        const uniqueProductIds = Array.from(new Set(order.items.map((item) => item.productId)));

        // Create reviews for all products in the order
        const createdReviews = await prisma.$transaction(async (tx) => {
            const reviews = [];

            for (const productId of uniqueProductIds) {
                // Find the order item for this product
                const orderItem = order.items.find((item) => item.productId === productId);

                const review = await tx.review.create({
                    data: {
                        productId,
                        userId: user.id,
                        orderId: order.id,
                        orderItemId: orderItem?.id,
                        rating,
                        shippingRating,
                        comment: comment || null,
                        isVerified: true,
                    },
                });
                reviews.push(review);
            }

            return reviews;
        });

        // Update product ratings for all reviewed products
        for (const productId of uniqueProductIds) {
            await updateProductRating(productId);
        }

        return successResponse({
            message: `Đã tạo ${createdReviews.length} đánh giá thành công`,
            reviewCount: createdReviews.length,
        }, 201);
    } catch (error) {
        return errorResponse("Không thể tạo đánh giá", 500, error);
    }
}

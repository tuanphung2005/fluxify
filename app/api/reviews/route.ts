import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";
import { isErrorResult } from "@/lib/api/responses";
import { updateProductRating } from "@/lib/db/ecommerce-queries";

// Validation schema for creating a review
const createReviewSchema = z.object({
    orderItemId: z.string().min(1, "Order item ID is required"),
    rating: z.number().int().min(1).max(5, "Product rating must be 1-5"),
    shippingRating: z.number().int().min(1).max(5, "Shipping rating must be 1-5"),
    comment: z.string().max(2000).optional(),
});

/**
 * POST /api/reviews - Create a review for an order item
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
        const { orderItemId, rating, shippingRating, comment } = validation.data;

        // Get order item with order details
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
            include: {
                order: true,
                product: true,
                review: true,
            },
        });

        if (!orderItem) {
            return errorResponse("Order item not found", 404);
        }

        // Verify order belongs to user
        if (orderItem.order.userId !== user.id) {
            return errorResponse("You cannot review this order", 403);
        }

        // Verify order is delivered
        if (orderItem.order.status !== "DELIVERED") {
            return errorResponse("You can only review delivered orders", 400);
        }

        // Check if already reviewed
        if (orderItem.review) {
            return errorResponse("You have already reviewed this item", 400);
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                productId: orderItem.productId,
                userId: user.id,
                orderId: orderItem.orderId,
                orderItemId: orderItem.id,
                rating,
                shippingRating,
                comment: comment || null,
                isVerified: true, // Order-based reviews are automatically verified
            },
            include: {
                product: {
                    select: { id: true, name: true },
                },
            },
        });

        // Update product average rating
        await updateProductRating(orderItem.productId);

        return successResponse(review, 201);
    } catch (error) {
        return errorResponse("Failed to create review", 500, error);
    }
}

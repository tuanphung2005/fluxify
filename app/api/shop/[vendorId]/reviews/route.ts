import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";

interface RouteParams {
    params: Promise<{
        vendorId: string;
    }>;
}

/**
 * Anonymize user name for display (e.g., "customer" -> "cus*****")
 */
function anonymizeUserName(name: string | null): string {
    if (!name || name.length < 3) {
        return "cus*****";
    }
    const prefix = name.slice(0, 3).toLowerCase();
    return `${prefix}*****`;
}

/**
 * GET /api/shop/[vendorId]/reviews - Get shop reviews with pagination
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { vendorId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Verify vendor exists
        const vendor = await prisma.vendorProfile.findUnique({
            where: { id: vendorId },
        });

        if (!vendor) {
            return errorResponse("Shop not found", 404);
        }

        // Get all products for this vendor
        const vendorProducts = await prisma.product.findMany({
            where: { vendorId, deletedAt: null },
            select: { id: true },
        });
        const productIds = vendorProducts.map((p) => p.id);

        // Get reviews for all vendor products with pagination
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: {
                    productId: { in: productIds },
                    orderId: { not: null }, // Only order-based reviews
                },
                include: {
                    user: {
                        select: { name: true },
                    },
                    product: {
                        select: { id: true, name: true, images: true },
                    },
                    orderItem: {
                        select: { selectedVariant: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.review.count({
                where: {
                    productId: { in: productIds },
                    orderId: { not: null },
                },
            }),
        ]);

        // Transform reviews with anonymized names
        const transformedReviews = reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            shippingRating: review.shippingRating,
            comment: review.comment,
            createdAt: review.createdAt,
            isVerified: review.isVerified,
            customerName: anonymizeUserName(review.user.name),
            product: {
                id: review.product.id,
                name: review.product.name,
                image: review.product.images[0] || null,
            },
            variant: review.orderItem?.selectedVariant || null,
        }));

        return successResponse({
            reviews: transformedReviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return errorResponse("Failed to fetch reviews", 500, error);
    }
}

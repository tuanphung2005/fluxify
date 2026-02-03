import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";

interface RouteParams {
    params: Promise<{
        vendorId: string;
    }>;
}

/**
 * GET /api/shop/[vendorId]/stats - Get shop overview statistics
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { vendorId } = await params;

        // Get vendor profile with creation date
        const vendor = await prisma.vendorProfile.findUnique({
            where: { id: vendorId },
            select: {
                id: true,
                storeName: true,
                createdAt: true,
            },
        });

        if (!vendor) {
            return errorResponse("Shop not found", 404);
        }

        // Get all products for this vendor
        const products = await prisma.product.findMany({
            where: { vendorId, deletedAt: null },
            select: { id: true },
        });
        const productIds = products.map((p) => p.id);

        // Get review statistics - only order-based reviews (with shippingRating)
        const reviews = await prisma.review.findMany({
            where: {
                productId: { in: productIds },
                orderId: { not: null },
            },
            select: {
                rating: true,
                shippingRating: true,
            },
        });

        // Calculate averages
        const totalReviews = reviews.length;
        let avgProductRating = 0;
        let avgShippingRating = 0;

        if (totalReviews > 0) {
            const productSum = reviews.reduce((acc, r) => acc + r.rating, 0);
            const shippingSum = reviews.reduce((acc, r) => acc + (r.shippingRating || 0), 0);

            avgProductRating = Number((productSum / totalReviews).toFixed(1));
            avgShippingRating = Number((shippingSum / totalReviews).toFixed(1));
        }

        // Calculate shop age
        const shopCreatedAt = vendor.createdAt;
        const now = new Date();
        const ageInDays = Math.floor(
            (now.getTime() - shopCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return successResponse({
            storeName: vendor.storeName,
            productCount: products.length,
            totalReviews,
            avgProductRating,
            avgShippingRating,
            shopCreatedAt: shopCreatedAt.toISOString(),
            shopAgeInDays: ageInDays,
        });
    } catch (error) {
        return errorResponse("Failed to fetch shop stats", 500, error);
    }
}

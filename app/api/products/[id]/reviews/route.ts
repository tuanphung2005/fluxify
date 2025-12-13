import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { auth } from "@/lib/auth";
import { z } from "zod";
import {
    getProductReviews,
    getReviewSummary,
    createReview,
} from "@/lib/db/ecommerce-queries";

const createReviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(200).optional(),
    comment: z.string().max(2000).optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get reviews for a product
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: productId } = await params;
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const includeSummary = searchParams.get("summary") === "true";

        const reviews = await getProductReviews(productId, { page, limit });

        if (includeSummary) {
            const summary = await getReviewSummary(productId);
            return successResponse({ ...reviews, summary });
        }

        return successResponse(reviews);
    } catch (error) {
        return errorResponse("Failed to fetch reviews", 500, error);
    }
}

// POST - Create a review (authenticated users only)
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user) {
            return errorResponse("Please log in to leave a review", 401);
        }

        const { id: productId } = await params;
        const body = await req.json();
        const validation = createReviewSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const review = await createReview({
            productId,
            userId: session.user.id,
            rating: validation.data.rating,
            title: validation.data.title,
            comment: validation.data.comment,
        });

        return successResponse(review, 201);
    } catch (error) {
        if (error instanceof Error && error.message.includes("already reviewed")) {
            return errorResponse(error.message, 400);
        }
        return errorResponse("Failed to create review", 500, error);
    }
}

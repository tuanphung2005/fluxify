import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { requireUser } from "@/lib/api/middleware";
import {
    getOrCreateWishlist,
    addToWishlist,
    removeFromWishlist,
} from "@/lib/db/ecommerce-queries";

// GET - Get user's wishlist
export async function GET(req: NextRequest) {
    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    try {
        const wishlist = await getOrCreateWishlist(auth.user.id);
        return successResponse(wishlist);
    } catch (error) {
        return errorResponse("Failed to fetch wishlist", 500, error);
    }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const { productId } = body;

        if (!productId || typeof productId !== "string") {
            return errorResponse("Product ID is required", 400);
        }

        const item = await addToWishlist(auth.user.id, productId);
        return successResponse(item, 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add to wishlist";
        return errorResponse(message, 500, error);
    }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return errorResponse("Product ID is required", 400);
        }

        await removeFromWishlist(auth.user.id, productId);
        return successResponse({ message: "Removed from wishlist" });
    } catch (error) {
        return errorResponse("Failed to remove from wishlist", 500, error);
    }
}

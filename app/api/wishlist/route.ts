import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { auth } from "@/lib/auth";
import {
    getOrCreateWishlist,
    addToWishlist,
    removeFromWishlist,
} from "@/lib/db/ecommerce-queries";

// GET - Get user's wishlist
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return errorResponse("Please log in to view wishlist", 401);
        }

        const wishlist = await getOrCreateWishlist(session.user.id);
        return successResponse(wishlist);
    } catch (error) {
        return errorResponse("Failed to fetch wishlist", 500, error);
    }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return errorResponse("Please log in to add to wishlist", 401);
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return errorResponse("Product ID is required", 400);
        }

        const item = await addToWishlist(session.user.id, productId);
        return successResponse(item, 201);
    } catch (error) {
        return errorResponse("Failed to add to wishlist", 500, error);
    }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return errorResponse("Please log in", 401);
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return errorResponse("Product ID is required", 400);
        }

        await removeFromWishlist(session.user.id, productId);
        return successResponse({ message: "Removed from wishlist" });
    } catch (error) {
        return errorResponse("Failed to remove from wishlist", 500, error);
    }
}

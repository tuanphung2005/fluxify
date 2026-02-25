import { NextRequest } from "next/server";

import {
  successResponse,
  errorResponse,
  isErrorResult,
} from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";
import { isInWishlist } from "@/lib/db/ecommerce-queries";

// GET - Check if a product is in the user's wishlist
export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();

  if (isErrorResult(auth)) {
    return errorResponse(auth.error, auth.status);
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }

    const inWishlist = await isInWishlist(auth.user.id, productId);

    return successResponse({ productId, inWishlist });
  } catch (error) {
    return errorResponse("Failed to check wishlist status", 500, error);
  }
}

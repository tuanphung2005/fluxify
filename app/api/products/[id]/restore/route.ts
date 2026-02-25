import { NextRequest } from "next/server";

import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";
import { getProductById, restoreProduct } from "@/lib/db/product-queries";

// PATCH - Restore a soft-deleted product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const productId = id;

    // Fetch product including soft-deleted ones
    const existingProduct = await getProductById(productId, true);

    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }

    if (existingProduct.vendorId !== auth.vendor.id) {
      return errorResponse("Unauthorized", 403);
    }

    if (!existingProduct.deletedAt) {
      return errorResponse("Product is not deleted", 400);
    }

    const restored = await restoreProduct(productId);

    return successResponse({
      message: "Product restored successfully",
      product: restored,
    });
  } catch (error) {
    return errorResponse("Failed to restore product", 500, error);
  }
}

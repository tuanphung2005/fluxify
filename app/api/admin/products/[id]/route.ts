import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";
import { getProductById, hardDeleteProduct } from "@/lib/db/product-queries";

// DELETE - Permanently delete a product (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const productId = id;

    // Check product exists (including soft-deleted)
    const existingProduct = await getProductById(productId, true);

    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }

    await hardDeleteProduct(productId);

    return successResponse({
      message: "Product permanently deleted",
    });
  } catch (error) {
    return errorResponse("Failed to permanently delete product", 500, error);
  }
}

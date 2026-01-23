import { NextRequest } from "next/server";
import { z } from "zod";

import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";
import {
  updateProduct,
  deleteProduct,
  getProductById,
} from "@/lib/db/product-queries";

// GET - Get single product by ID (public endpoint for cart validation)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
  } catch (error) {
    return errorResponse("Failed to fetch product", 500, error);
  }
}

// Validation schema for updates (all fields optional)
const updateProductSchema = z.object({
  name: z.string().min(1, "Product name cannot be empty").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  stock: z.number().int().min(0, "Stock must be non-negative").optional(),
  images: z.array(z.string().url("Each image must be a valid URL")).optional(),
  variants: z.any().optional(),
  variantStock: z.any().optional(),
});

export async function PUT(
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
    const body = await req.json();

    // Verify ownership
    const existingProduct = await getProductById(productId);

    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }

    if (existingProduct.vendorId !== auth.vendor.id) {
      return errorResponse("Unauthorized", 403);
    }

    // Validate input
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const updatedProduct = await updateProduct(productId, validation.data);

    return successResponse(updatedProduct);
  } catch (error) {
    return errorResponse("Failed to update product", 500, error);
  }
}

export async function DELETE(
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

    // Verify ownership
    const existingProduct = await getProductById(productId);

    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }

    if (existingProduct.vendorId !== auth.vendor.id) {
      return errorResponse("Unauthorized", 403);
    }

    await deleteProduct(productId);

    return successResponse({ message: "Product deleted successfully" });
  } catch (error) {
    return errorResponse("Failed to delete product", 500, error);
  }
}

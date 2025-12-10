import { NextRequest } from "next/server";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { errorResponse, successResponse, isErrorResult } from "@/lib/api/responses";
import { getVendorProducts, createProduct } from "@/lib/db/product-queries";
import { z } from "zod";

// Validation schema
const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().min(0, "Stock must be non-negative"),
    images: z.array(z.string().url("Each image must be a valid URL")),
    variants: z.any().optional(),
});

// GET - List vendor's products
export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        const result = await getVendorProducts(auth.vendor.id, { page, limit, search });
        return successResponse(result);
    } catch (error) {
        return errorResponse("Failed to fetch products", 500, error);
    }
}

// POST - Create a new product
export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();

        // Validate input
        const validation = createProductSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(
                validation.error.issues[0].message,
                400
            );
        }

        const product = await createProduct({
            ...validation.data,
            vendorId: auth.vendor.id,
        });

        return successResponse(product, 201);
    } catch (error) {
        return errorResponse("Failed to create product", 500, error);
    }
}

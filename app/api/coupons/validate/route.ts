import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { validateCoupon } from "@/lib/db/ecommerce-queries";

// POST - Validate a coupon code
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, cartTotal, vendorId } = body;

        if (!code) {
            return errorResponse("Coupon code is required", 400);
        }

        if (typeof cartTotal !== "number" || cartTotal <= 0) {
            return errorResponse("Valid cart total is required", 400);
        }

        const result = await validateCoupon(code, cartTotal, vendorId);

        if (!result.valid) {
            return errorResponse(result.error || "Invalid coupon", 400);
        }

        return successResponse({
            valid: true,
            discount: result.discountAmount,
            coupon: {
                code: result.coupon?.code,
                discountType: result.coupon?.discountType,
                discountValue: result.coupon?.discountValue,
            },
        });
    } catch (error) {
        return errorResponse("Failed to validate coupon", 500, error);
    }
}

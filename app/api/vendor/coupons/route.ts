import { NextRequest } from "next/server";
import { successResponse, errorResponse, isErrorResult } from "@/lib/api/responses";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { z } from "zod";
import {
    getVendorCoupons,
    createCoupon,
    deleteCoupon,
} from "@/lib/db/ecommerce-queries";

const createCouponSchema = z.object({
    code: z.string().min(3).max(20),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive(),
    minPurchase: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
});

// GET - List vendor's coupons
export async function GET() {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const coupons = await getVendorCoupons(auth.vendor.id);
        return successResponse(coupons);
    } catch (error) {
        return errorResponse("Failed to fetch coupons", 500, error);
    }
}

// POST - Create a new coupon
export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();
        const validation = createCouponSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const coupon = await createCoupon({
            ...validation.data,
            vendorId: auth.vendor.id,
            validFrom: validation.data.validFrom ? new Date(validation.data.validFrom) : undefined,
            validUntil: validation.data.validUntil ? new Date(validation.data.validUntil) : undefined,
        });

        return successResponse(coupon, 201);
    } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
            return errorResponse(error.message, 400);
        }
        return errorResponse("Failed to create coupon", 500, error);
    }
}

// DELETE - Delete a coupon
export async function DELETE(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const { searchParams } = new URL(req.url);
        const couponId = searchParams.get("id");

        if (!couponId) {
            return errorResponse("Coupon ID is required", 400);
        }

        await deleteCoupon(couponId, auth.vendor.id);
        return successResponse({ message: "Coupon deleted" });
    } catch (error) {
        return errorResponse("Failed to delete coupon", 500, error);
    }
}

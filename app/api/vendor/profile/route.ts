import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { errorResponse, successResponse, isErrorResult } from "@/lib/api/responses";
import { z } from "zod";

// Validation schema
const updateProfileSchema = z.object({
    storeName: z.string().min(1).optional(),
    description: z.string().optional(),
    favicon: z.string().url("Favicon must be a valid URL").optional(),
});

// PATCH - Update vendor profile
export async function PATCH(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();

        // Validate input
        const validation = updateProfileSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(
                validation.error.issues[0].message,
                400
            );
        }

        // Update vendor profile
        const updatedProfile = await prisma.vendorProfile.update({
            where: { id: auth.vendor.id },
            data: validation.data,
        });

        return successResponse(updatedProfile);
    } catch (error) {
        return errorResponse("Failed to update vendor profile", 500, error);
    }
}

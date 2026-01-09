import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { z } from "zod";
import { fetchVietQRBanks } from "@/lib/vietqr";

const paymentSettingsSchema = z.object({
    bankId: z.string(),
    bankAccount: z.string().min(6).max(19).regex(/^\d+$/, "Account number must contain only digits"),
    bankAccountName: z.string().min(3).max(50),
});

/**
 * GET /api/vendor/payment
 * Get vendor's payment settings
 */
export async function GET() {
    try {
        const auth = await getAuthenticatedVendor();
        if ('error' in auth) {
            return errorResponse(auth.error, auth.status);
        }

        const vendor = await prisma.vendorProfile.findUnique({
            where: { id: auth.vendor.id },
            select: {
                bankId: true,
                bankAccount: true,
                bankAccountName: true,
            },
        });

        return successResponse({
            bankId: vendor?.bankId || null,
            bankAccount: vendor?.bankAccount || null,
            bankAccountName: vendor?.bankAccountName || null,
        });
    } catch (error) {
        return errorResponse("Failed to fetch payment settings", 500, error);
    }
}

/**
 * PUT /api/vendor/payment
 * Update vendor's payment settings
 */
export async function PUT(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if ('error' in auth) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();
        const validation = paymentSettingsSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { bankId, bankAccount, bankAccountName } = validation.data;

        // Verify bankId is valid
        const banks = await fetchVietQRBanks();
        const isValidBank = banks.some(b => b.code === bankId);

        if (!isValidBank) {
            return errorResponse("Invalid bank ID", 400);
        }

        const updated = await prisma.vendorProfile.update({
            where: { id: auth.vendor.id },
            data: {
                bankId,
                bankAccount,
                // Store account name in uppercase without diacritics for VietQR compatibility
                bankAccountName: bankAccountName.toUpperCase(),
            },
            select: {
                bankId: true,
                bankAccount: true,
                bankAccountName: true,
            },
        });

        return successResponse(updated);
    } catch (error) {
        return errorResponse("Failed to update payment settings", 500, error);
    }
}

import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";

interface RouteParams {
  params: Promise<{
    vendorId: string;
  }>;
}

/**
 * GET /api/shop/[vendorId]/payment
 * Get vendor's public payment info for checkout
 * public endpoint
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        bankId: true,
        bankAccount: true,
        bankAccountName: true,
      },
    });

    if (!vendor) {
      return errorResponse("Vendor not found", 404);
    }

    return successResponse({
      bankId: vendor.bankId || null,
      bankAccount: vendor.bankAccount || null,
      bankAccountName: vendor.bankAccountName || null,
    });
  } catch (error) {
    return errorResponse("Failed to fetch payment info", 500, error);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";

const favoriteShopSchema = z.object({
  vendorId: z.string(),
});

/**
 * POST /api/user/personal/favorite-shops
 * Add a shop to favorites
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const validation = favoriteShopSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { vendorId } = validation.data;

    // Check if vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return errorResponse("Shop not found", 404);
    }

    // Add to favorites (upsert to avoid duplicates)
    const favoriteShop = await prisma.favoriteShop.upsert({
      where: {
        userId_vendorId: {
          userId: auth.user.id,
          vendorId: vendorId,
        },
      },
      create: {
        userId: auth.user.id,
        vendorId: vendorId,
      },
      update: {},
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            description: true,
            favicon: true,
          },
        },
      },
    });

    return successResponse(favoriteShop, 201);
  } catch (error) {
    return errorResponse("Failed to add favorite shop", 500, error);
  }
}

/**
 * DELETE /api/user/personal/favorite-shops
 * Remove a shop from favorites
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const validation = favoriteShopSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { vendorId } = validation.data;

    // Remove from favorites
    await prisma.favoriteShop.deleteMany({
      where: {
        userId: auth.user.id,
        vendorId: vendorId,
      },
    });

    return successResponse({ message: "Shop removed from favorites" });
  } catch (error) {
    return errorResponse("Failed to remove favorite shop", 500, error);
  }
}

import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";

// PUT - Batch update component configs
export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const { updates } = body as {
      updates: Array<{ id: string; config: any }>;
    };

    if (!updates || !Array.isArray(updates)) {
      return errorResponse("Invalid updates format", 400);
    }

    // Batch update all components in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.shopComponent.updateMany({
          where: {
            id: update.id,
            template: {
              vendorId: auth.vendor.id,
            },
          },
          data: {
            config: update.config,
          },
        }),
      ),
    );

    // Fetch and return updated components
    const componentIds = updates.map((u) => u.id);
    const components = await prisma.shopComponent.findMany({
      where: {
        id: { in: componentIds },
      },
      orderBy: { order: "asc" },
    });

    return successResponse(components);
  } catch (error) {
    return errorResponse("Failed to update components", 500, error);
  }
}

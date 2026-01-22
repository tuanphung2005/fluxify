import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";

// PUT - Reorder components
export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const { components } = body as {
      components: Array<{ id: string; order: number }>;
    };

    await prisma.$transaction(async (tx) => {
      // Get all component IDs that belong to this vendor
      const componentIds = components.map((c) => c.id);

      // Verify all components belong to this vendor
      const existingComponents = await tx.shopComponent.findMany({
        where: {
          id: { in: componentIds },
          template: {
            vendorId: auth.vendor.id,
          },
        },
      });

      if (existingComponents.length !== components.length) {
        throw new Error("Some components not found or unauthorized");
      }

      // Phase 1: Set to temporary negative values
      for (let i = 0; i < components.length; i++) {
        await tx.shopComponent.update({
          where: { id: components[i].id },
          data: { order: -(i + 1) },
        });
      }

      // Phase 2: Update to final order values
      for (const comp of components) {
        await tx.shopComponent.update({
          where: { id: comp.id },
          data: { order: comp.order },
        });
      }
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to reorder components", 500, error);
  }
}

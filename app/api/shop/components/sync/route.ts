import { NextRequest } from "next/server";
import { ComponentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedVendor,
  verifyTemplateOwnership,
} from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";

// POST - Sync all components
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const { templateId, components } = body as {
      templateId: string;
      components: Array<{
        id: string;
        type: ComponentType;
        order: number;
        config: any;
      }>;
    };

    if (!templateId) {
      return errorResponse("Template ID required", 400);
    }

    // Verify template ownership
    const ownershipCheck = await verifyTemplateOwnership(
      templateId,
      auth.vendor.id,
    );

    if (isErrorResult(ownershipCheck)) {
      return errorResponse(ownershipCheck.error, ownershipCheck.status);
    }

    // Perform sync
    await prisma.$transaction(async (tx) => {
      const existingComponents = await tx.shopComponent.findMany({
        where: { templateId },
        select: { id: true },
      });
      const existingIds = new Set(existingComponents.map((c) => c.id));

      const payloadIds = new Set(
        components.filter((c) => !c.id.startsWith("temp_")).map((c) => c.id),
      );
      const idsToDelete = existingComponents
        .filter((c) => !payloadIds.has(c.id))
        .map((c) => c.id);

      const idsToUpdate = components
        .filter((c) => !c.id.startsWith("temp_"))
        .map((c) => c.id);

      for (let i = 0; i < idsToUpdate.length; i++) {
        await tx.shopComponent.update({
          where: { id: idsToUpdate[i] },
          data: { order: -1000 - i },
        });
      }

      if (idsToDelete.length > 0) {
        await tx.shopComponent.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        const order = i;

        if (comp.id.startsWith("temp_")) {
          // CREATE
          await tx.shopComponent.create({
            data: {
              templateId,
              type: comp.type,
              order: order,
              config: comp.config,
            },
          });
        } else {
          // UPDATE
          await tx.shopComponent.update({
            where: { id: comp.id },
            data: {
              order: order,
              config: comp.config,
            },
          });
        }
      }
    });

    // Fetch
    const finalComponents = await prisma.shopComponent.findMany({
      where: { templateId },
      orderBy: { order: "asc" },
    });

    return successResponse(finalComponents);
  } catch (error) {
    return errorResponse("Failed to sync components", 500, error);
  }
}

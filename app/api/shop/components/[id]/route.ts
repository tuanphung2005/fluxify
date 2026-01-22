import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedVendor,
  verifyComponentOwnership,
} from "@/lib/api/auth-helpers";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";
import {
  validateComponentConfig,
  sanitizeComponentConfig,
} from "@/lib/shop/component-config";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT - Update component
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const { config } = body;

    // Verify ownership and get component type
    const ownershipCheck = await verifyComponentOwnership(id, auth.vendor.id);

    if (isErrorResult(ownershipCheck)) {
      return errorResponse(ownershipCheck.error, ownershipCheck.status);
    }

    // Validate and sanitize config (same as POST endpoint)
    const configValidation = validateComponentConfig(
      ownershipCheck.component.type,
      config,
    );

    if (!configValidation.success) {
      return errorResponse(`Invalid config: ${configValidation.error}`, 400);
    }
    const sanitizedConfig = sanitizeComponentConfig(
      ownershipCheck.component.type,
      config,
    );

    // Update component with validated and sanitized config
    const updatedComponent = await prisma.shopComponent.update({
      where: { id },
      data: { config: sanitizedConfig || {} },
    });

    return successResponse(updatedComponent);
  } catch (error) {
    return errorResponse("Failed to update component", 500, error);
  }
}

// DELETE - Delete component
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const params = await context.params;
    const { id } = params;

    // Verify ownership
    const ownershipCheck = await verifyComponentOwnership(id, auth.vendor.id);

    if (isErrorResult(ownershipCheck)) {
      return errorResponse(ownershipCheck.error, ownershipCheck.status);
    }

    // Delete component
    await prisma.shopComponent.delete({
      where: { id },
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete component", 500, error);
  }
}

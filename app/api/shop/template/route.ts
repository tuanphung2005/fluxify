import { NextRequest } from "next/server";

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

// GET - Fetch vendor's shop template
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    // Fetch template with components and vendor details
    const template = await prisma.shopTemplate.findUnique({
      where: { vendorId: auth.vendor.id },
      include: {
        components: {
          orderBy: { order: "asc" },
        },
        vendor: {
          select: {
            storeName: true,
            favicon: true,
          },
        },
      },
    });

    return successResponse(template);
  } catch (error) {
    return errorResponse("Failed to fetch shop template", 500, error);
  }
}

// POST - Create new shop template
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const { name } = body;

    const template = await prisma.shopTemplate.create({
      data: {
        vendorId: auth.vendor.id,
        name: name || "My Shop",
        isPublished: false,
      },
      include: {
        components: true,
      },
    });

    return successResponse(template, 201);
  } catch (error) {
    return errorResponse("Failed to create shop template", 500, error);
  }
}

// PUT - Update shop template
export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const { id, name, isPublished } = body;

    // Verify ownership
    const ownershipCheck = await verifyTemplateOwnership(id, auth.vendor.id);

    if (isErrorResult(ownershipCheck)) {
      return errorResponse(ownershipCheck.error, ownershipCheck.status);
    }

    const { template } = ownershipCheck;

    // Prepare update data
    const updateData: any = {
      name: name !== undefined ? name : template.name,
      isPublished:
        isPublished !== undefined ? isPublished : template.isPublished,
    };

    // If publishing, create a snapshot of current components
    if (isPublished === true) {
      const currentComponents = await prisma.shopComponent.findMany({
        where: { templateId: id },
        orderBy: { order: "asc" },
      });

      updateData.publishedComponents = currentComponents;
    }

    // Update template
    const updatedTemplate = await prisma.shopTemplate.update({
      where: { id },
      data: updateData,
      include: {
        components: {
          orderBy: { order: "asc" },
        },
      },
    });

    return successResponse(updatedTemplate);
  } catch (error) {
    return errorResponse("Failed to update shop template", 500, error);
  }
}

// DELETE - Delete shop template
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Template ID required", 400);
    }

    // Verify ownership
    const ownershipCheck = await verifyTemplateOwnership(id, auth.vendor.id);

    if (isErrorResult(ownershipCheck)) {
      return errorResponse(ownershipCheck.error, ownershipCheck.status);
    }

    // Delete template (cascade will delete components)
    await prisma.shopTemplate.delete({
      where: { id },
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete shop template", 500, error);
  }
}

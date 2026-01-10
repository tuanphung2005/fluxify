import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComponentType } from "@prisma/client";
import { getAuthenticatedVendor, verifyTemplateOwnership } from "@/lib/api/auth-helpers";
import { errorResponse, successResponse, isErrorResult } from "@/lib/api/responses";
import { getTemplateComponents } from "@/lib/db/shop-queries";
import { validateComponentConfig, sanitizeComponentConfig } from "@/lib/shop/component-config";

// GET - Fetch all components for a template
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get("templateId");

        if (!templateId) {
            return errorResponse("Template ID required", 400);
        }

        const components = await getTemplateComponents(templateId);
        return successResponse(components);
    } catch (error) {
        return errorResponse("Failed to fetch components", 500, error);
    }
}

// POST - Add new component
export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();
        const { templateId, type, config, order } = body;

        // Validate component type
        if (!Object.values(ComponentType).includes(type)) {
            return errorResponse(`Invalid component type: ${type}`, 400);
        }

        // Validate and sanitize config
        const configValidation = validateComponentConfig(type, config);
        if (!configValidation.success) {
            return errorResponse(`Invalid config: ${configValidation.error}`, 400);
        }
        const sanitizedConfig = sanitizeComponentConfig(type, config);

        // Verify template ownership
        const ownershipCheck = await verifyTemplateOwnership(templateId, auth.vendor.id);
        if (isErrorResult(ownershipCheck)) {
            return errorResponse(ownershipCheck.error, ownershipCheck.status);
        }

        // Calculate order if not provided
        let newOrder = order;
        if (newOrder === undefined || newOrder === null) {
            const lastComponent = await prisma.shopComponent.findFirst({
                where: { templateId },
                orderBy: { order: "desc" },
            });
            newOrder = (lastComponent?.order ?? -1) + 1;
        }

        // Create component with validated config
        const component = await prisma.shopComponent.create({
            data: {
                templateId,
                type: type as ComponentType,
                order: newOrder,
                config: sanitizedConfig || {},
            },
        });

        return successResponse(component, 201);
    } catch (error) {
        return errorResponse("Failed to create component", 500, error);
    }
}

// PATCH - Reorder components (deprecated - use /reorder endpoint instead)
export async function PATCH(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();
        const { components } = body; // Array of { id, order }

        // Update component orders in transaction
        await prisma.$transaction(
            components.map((comp: { id: string; order: number }) =>
                prisma.shopComponent.update({
                    where: { id: comp.id },
                    data: { order: comp.order },
                })
            )
        );

        return successResponse({ success: true });
    } catch (error) {
        return errorResponse("Failed to reorder components", 500, error);
    }
}

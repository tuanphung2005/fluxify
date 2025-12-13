import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { auth } from "@/lib/auth";
import {
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "@/lib/db/ecommerce-queries";
import { z } from "zod";

const updateCategorySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    image: z.string().url().nullable().optional(),
    parentId: z.string().nullable().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single category
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const category = await getCategoryById(id);

        if (!category) {
            return errorResponse("Category not found", 404);
        }

        return successResponse(category);
    } catch (error) {
        return errorResponse("Failed to fetch category", 500, error);
    }
}

// PUT - Update category (Admin only)
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return errorResponse("Unauthorized", 401);
        }

        const { id } = await params;
        const body = await req.json();
        const validation = updateCategorySchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const category = await updateCategory(id, validation.data);
        return successResponse(category);
    } catch (error) {
        return errorResponse("Failed to update category", 500, error);
    }
}

// DELETE - Delete category (Admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return errorResponse("Unauthorized", 401);
        }

        const { id } = await params;
        await deleteCategory(id);
        return successResponse({ message: "Category deleted" });
    } catch (error) {
        return errorResponse("Failed to delete category", 500, error);
    }
}

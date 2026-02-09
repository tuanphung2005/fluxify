import { NextRequest } from "next/server";
import { z } from "zod";

import {
  successResponse,
  errorResponse,
  isErrorResult,
} from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/auth-helpers";
import {
  getAllCategories,
  createCategory,
  generateUniqueSlug,
} from "@/lib/db/ecommerce-queries";

// Validation schema
const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
});

// GET - List all categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeChildren = searchParams.get("children") === "true";
    const includeProductCount = searchParams.get("count") === "true";

    const categories = await getAllCategories({
      includeChildren,
      includeProductCount,
    });

    return successResponse(categories);
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500, error);
  }
}

// POST - Create a new category (Admin only)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { name, description, image, parentId } = validation.data;

    // Generate slug if not provided
    // a slug transforms a string into a readable format
    // why? seo, readability, performance
    const slug = validation.data.slug || (await generateUniqueSlug(name));

    const category = await createCategory({
      name,
      slug,
      description,
      image,
      parentId,
    });

    return successResponse(category, 201);
  } catch (error) {
    return errorResponse("Failed to create category", 500, error);
  }
}

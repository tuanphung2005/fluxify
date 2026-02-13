import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Validate and normalize pagination parameters
 */
export function normalizePagination(options: {
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export async function getVendorProducts(
  vendorId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
  } = {},
) {
  const { page, limit, skip } = normalizePagination(options);
  const { search = "", includeDeleted = false } = options;

  const where: Record<string, unknown> = {
    vendorId,
    // Filter out soft-deleted products by default
    ...(includeDeleted ? {} : { deletedAt: null }),
  };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export function getProductById(id: string, includeDeleted = false) {
  return prisma.product.findFirst({
    where: {
      id,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
    include: { vendor: true },
  });
}

export function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  variants?: Prisma.InputJsonValue;
  variantStock?: Prisma.InputJsonValue;
  vendorId: string;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      images: data.images,
      variants: data.variants,
      variantStock: data.variantStock,
      vendorId: data.vendorId,
    },
  });
}

export function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    images?: string[];
    variants?: Prisma.InputJsonValue;
    variantStock?: Prisma.InputJsonValue;
  },
) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

/**
 * Soft delete a product by setting deletedAt timestamp
 */
export function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Permanently delete a product (use with caution)
 */
export function hardDeleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

/**
 * Restore a soft-deleted product
 */
export function restoreProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: null },
  });
}

/**
 * Atomically update product stock (variant or standard)
 * Handles both increment and decrement operations
 */
export async function updateVariantStock(
  tx: Omit<
    Prisma.TransactionClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  productId: string,
  quantity: number,
  operation: "increment" | "decrement",
  selectedVariant?: string,
) {
  if (selectedVariant) {

    if (operation === "increment") {
      await tx.$executeRaw`
        UPDATE "products"
        SET "variantStock" = jsonb_set(
            COALESCE("variantStock", '{}'::jsonb),
            ${[selectedVariant]}::text[],
            to_jsonb(
                COALESCE(("variantStock"->${selectedVariant})::int, 0) + ${quantity}
            )
        )
        WHERE id = ${productId}`;
    } else {
      const result = await tx.$executeRaw`
        UPDATE "products"
        SET "variantStock" = jsonb_set(
            COALESCE("variantStock", '{}'::jsonb),
            ${[selectedVariant]}::text[],
            to_jsonb(
                COALESCE(("variantStock"->${selectedVariant})::int, 0) - ${quantity}
            )
        )
        WHERE id = ${productId}
        AND COALESCE(("variantStock"->${selectedVariant})::int, 0) >= ${quantity}`;

      if (result === 0) {
        throw new Error(`Insufficient stock for variant: ${selectedVariant}`);
      }
    }
  } else {
    // General stock uses Prisma's atomic operations
    await tx.product.update({
      where: { id: productId },
      data: {
        stock: {
          [operation]: quantity,
        },
      },
    });
  }
}

// Export utilities for reuse
export { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE };

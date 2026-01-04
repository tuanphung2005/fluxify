import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Validate and normalize pagination parameters
 */
export function normalizePagination(options: { page?: number; limit?: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(Math.max(1, options.limit || DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

export async function getVendorProducts(
    vendorId: string,
    options: {
        page?: number;
        limit?: number;
        search?: string;
    } = {}
) {
    const { page, limit, skip } = normalizePagination(options);
    const { search = "" } = options;

    const where: Record<string, unknown> = {
        vendorId,
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

export function getProductById(id: string) {
    return prisma.product.findUnique({
        where: { id },
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
    }
) {
    return prisma.product.update({
        where: { id },
        data,
    });
}

export function deleteProduct(id: string) {
    return prisma.product.delete({
        where: { id },
    });
}

// Export utilities for reuse
export { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE };

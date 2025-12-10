import { prisma } from "@/lib/prisma";

export async function getVendorProducts(
    vendorId: string,
    options: {
        page?: number;
        limit?: number;
        search?: string;
    } = {}
) {
    const { page = 1, limit = 10, search = "" } = options;
    const skip = (page - 1) * limit;

    const where: any = {
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
    variants?: any;
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
        variants?: any;
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

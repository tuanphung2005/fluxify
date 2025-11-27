import { prisma } from "@/lib/prisma";

export function getVendorProducts(vendorId: string) {
    return prisma.product.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
    });
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

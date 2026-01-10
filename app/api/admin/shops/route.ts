import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/middleware";
import { errorResponse, successResponse } from "@/lib/api/responses";

export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
        const search = searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { storeName: { contains: search, mode: "insensitive" } },
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
            ];
        }

        const [shops, total] = await Promise.all([
            prisma.vendorProfile.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    shopTemplate: {
                        select: {
                            isPublished: true
                        }
                    },
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.vendorProfile.count({ where })
        ]);

        const formattedShops = shops.map(shop => ({
            id: shop.id,
            name: shop.storeName,
            slug: shop.userId,
            isPublished: shop.shopTemplate?.isPublished || false,
            createdAt: shop.createdAt,
            user: shop.user,
            _count: shop._count
        }));

        return successResponse({
            shops: formattedShops,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        return errorResponse("Failed to fetch shops", 500, error);
    }
}

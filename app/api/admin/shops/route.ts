import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        const where: any = {};
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

        // Transform data to match frontend expectation
        const formattedShops = shops.map(shop => ({
            id: shop.id,
            name: shop.storeName,
            slug: shop.userId, // Using userId as slug for now as per existing logic
            isPublished: shop.shopTemplate?.isPublished || false,
            createdAt: shop.createdAt,
            user: shop.user,
            _count: shop._count
        }));

        return NextResponse.json({
            shops: formattedShops,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Failed to fetch shops:", error);
        return NextResponse.json(
            { error: "Failed to fetch shops" },
            { status: 500 }
        );
    }
}

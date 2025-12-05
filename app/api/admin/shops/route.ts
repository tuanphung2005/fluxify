import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const shops = await prisma.vendorProfile.findMany({
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
            }
        });

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

        return NextResponse.json(formattedShops);
    } catch (error) {
        console.error("Failed to fetch shops:", error);
        return NextResponse.json(
            { error: "Failed to fetch shops" },
            { status: 500 }
        );
    }
}

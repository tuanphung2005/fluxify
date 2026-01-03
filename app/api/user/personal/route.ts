import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";

/**
 * GET /api/user/personal
 * Fetch all personal dashboard data for the authenticated user
 * Returns: stats, orders, favorite shops
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return errorResponse("User not found", 404);
        }

        // Fetch all data in parallel
        const [orders, favoriteShops, stats] = await Promise.all([
            // Orders with items and address
            prisma.order.findMany({
                where: { userId: user.id },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true,
                                    price: true,
                                },
                            },
                        },
                    },
                    address: true,
                },
                orderBy: { createdAt: "desc" },
            }),

            // Favorite shops
            prisma.favoriteShop.findMany({
                where: { userId: user.id },
                include: {
                    vendor: {
                        select: {
                            id: true,
                            storeName: true,
                            description: true,
                            favicon: true,
                            _count: {
                                select: { products: true },
                            },
                        },
                    },
                },
                orderBy: { addedAt: "desc" },
            }),

            // Calculate stats
            prisma.order.aggregate({
                where: {
                    userId: user.id,
                    status: { not: "CANCELLED" },
                },
                _count: { id: true },
                _sum: { total: true },
            }),
        ]);

        return successResponse({
            user: {
                name: user.name,
                email: user.email,
                memberSince: user.createdAt,
            },
            stats: {
                totalOrders: stats._count.id || 0,
                totalSpent: Number(stats._sum.total) || 0,
            },
            orders,
            favoriteShops: favoriteShops.map((fs) => ({
                id: fs.id,
                addedAt: fs.addedAt,
                vendor: {
                    id: fs.vendor.id,
                    storeName: fs.vendor.storeName,
                    description: fs.vendor.description,
                    favicon: fs.vendor.favicon,
                    productCount: fs.vendor._count.products,
                },
            })),
        });
    } catch (error) {
        console.error("Failed to fetch personal data:", error);
        return errorResponse("Failed to fetch personal data", 500, error);
    }
}

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, isErrorResult } from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";

/**
 * GET /api/user/personal
 * Fetch all personal dashboard data for the authenticated user
 * Returns: stats, orders, favorite shops
 */
export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        // Fetch all data in parallel
        const [user, orders, favoriteShops, stats] = await Promise.all([
            // Get full user data
            prisma.user.findUnique({
                where: { id: auth.user.id },
                select: { name: true, email: true, createdAt: true }
            }),
            
            // Orders with items and address
            prisma.order.findMany({
                where: { userId: auth.user.id },
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
                where: { userId: auth.user.id },
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
                    userId: auth.user.id,
                    status: { not: "CANCELLED" },
                },
                _count: { id: true },
                _sum: { total: true },
            }),
        ]);

        return successResponse({
            user: {
                name: user?.name,
                email: user?.email,
                memberSince: user?.createdAt,
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
        return errorResponse("Không thể lấy dữ liệu cá nhân", 500, error);
    }
}


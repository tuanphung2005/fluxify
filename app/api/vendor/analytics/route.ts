import { NextRequest } from "next/server";
import { successResponse, errorResponse, isErrorResult } from "@/lib/api/responses";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET - Get vendor analytics data
export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const vendorId = auth.vendor.id;
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "30");

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all vendor product IDs
        const products = await prisma.product.findMany({
            where: { vendorId },
            select: { id: true, name: true, price: true, images: true, viewCount: true },
        });
        const productIds = products.map(p => p.id);

        // Get orders containing vendor's products
        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: { in: productIds },
                order: {
                    createdAt: { gte: startDate },
                },
            },
            include: {
                order: {
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
            },
        });

        // Calculate totals
        const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        const totalOrders = new Set(orderItems.map(item => item.order.id)).size;
        const totalProducts = products.length;
        const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);

        // Calculate conversion rate (orders / views)
        const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get revenue by date for chart
        const revenueByDate: Record<string, number> = {};
        const ordersByDate: Record<string, number> = {};
        const orderIdsByDate: Record<string, Set<string>> = {};

        orderItems.forEach(item => {
            const date = item.order.createdAt.toISOString().split("T")[0];
            revenueByDate[date] = (revenueByDate[date] || 0) + Number(item.price) * item.quantity;

            if (!orderIdsByDate[date]) {
                orderIdsByDate[date] = new Set();
            }
            orderIdsByDate[date].add(item.order.id);
        });

        // Convert sets to counts
        Object.keys(orderIdsByDate).forEach(date => {
            ordersByDate[date] = orderIdsByDate[date].size;
        });

        // Fill in missing dates
        const revenueChartData = [];
        const ordersChartData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            revenueChartData.push({
                date: dateStr,
                value: revenueByDate[dateStr] || 0,
            });

            ordersChartData.push({
                date: dateStr,
                value: ordersByDate[dateStr] || 0,
            });
        }

        // Get top products by revenue
        const productRevenue: Record<string, { product: typeof products[0]; totalSold: number; totalRevenue: number }> = {};

        orderItems.forEach(item => {
            if (!productRevenue[item.productId]) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    productRevenue[item.productId] = {
                        product,
                        totalSold: 0,
                        totalRevenue: 0,
                    };
                }
            }
            if (productRevenue[item.productId]) {
                productRevenue[item.productId].totalSold += item.quantity;
                productRevenue[item.productId].totalRevenue += Number(item.price) * item.quantity;
            }
        });

        const topProducts = Object.values(productRevenue)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(item => ({
                product: item.product,
                totalSold: item.totalSold,
                totalRevenue: item.totalRevenue,
                viewCount: item.product.viewCount,
            }));

        // Get recent orders
        const recentOrderIds = [...new Set(orderItems.map(item => item.order.id))].slice(0, 5);
        const recentOrders = await prisma.order.findMany({
            where: { id: { in: recentOrderIds } },
            include: {
                user: { select: { name: true, email: true } },
                items: {
                    where: { productId: { in: productIds } },
                    include: { product: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return successResponse({
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalOrders,
            totalProducts,
            totalViews,
            conversionRate: Number(conversionRate.toFixed(2)),
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
            revenueByDate: revenueChartData,
            ordersByDate: ordersChartData,
            topProducts,
            recentOrders,
        });
    } catch (error) {
        return errorResponse("Failed to fetch analytics", 500, error);
    }
}

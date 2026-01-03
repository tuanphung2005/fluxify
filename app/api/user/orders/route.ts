import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { z } from "zod";

/**
 * GET /api/user/orders
 * Fetch all orders for the authenticated user
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

        const orders = await prisma.order.findMany({
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
        });

        return successResponse(orders);
    } catch (error) {
        console.error("Failed to fetch user orders:", error);
        return errorResponse("Failed to fetch orders", 500, error);
    }
}

const cancelOrderSchema = z.object({
    orderId: z.string(),
});

/**
 * PATCH /api/user/orders
 * Cancel an order (only if PENDING or PROCESSING)
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await req.json();
        const validation = cancelOrderSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { orderId } = validation.data;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return errorResponse("User not found", 404);
        }

        // Find the order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return errorResponse("Order not found", 404);
        }

        if (order.userId !== user.id) {
            return errorResponse("Unauthorized", 403);
        }

        // Only allow cancellation if PENDING or PROCESSING
        if (order.status !== "PENDING" && order.status !== "PROCESSING") {
            return errorResponse(
                "Order cannot be cancelled. Only pending or processing orders can be cancelled.",
                400
            );
        }

        // Cancel the order and restore stock
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Restore stock for each item
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            // Update order status
            return tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
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
            });
        });

        return successResponse(updatedOrder);
    } catch (error) {
        console.error("Failed to cancel order:", error);
        return errorResponse("Failed to cancel order", 500, error);
    }
}

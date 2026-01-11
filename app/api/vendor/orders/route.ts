import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { isErrorResult } from "@/lib/api/responses";
import { logOrderStatusChange } from "@/lib/api/audit";
import { z } from "zod";

export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: auth.vendor.id
                        }
                    }
                }
            },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                total: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                items: {
                    where: {
                        product: {
                            vendorId: auth.vendor.id
                        }
                    },
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                address: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return successResponse(orders);
    } catch (error) {
        return errorResponse("Failed to fetch orders", 500, error);
    }
}

const updateStatusSchema = z.object({
    orderId: z.string(),
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(req: NextRequest) {
    try {
        const auth = await getAuthenticatedVendor();
        if (isErrorResult(auth)) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await req.json();
        const validation = updateStatusSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { orderId, status } = validation.data;

        // Verify the order contains items from this vendor
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                items: {
                    some: {
                        product: {
                            vendorId: auth.vendor.id
                        }
                    }
                }
            }
        });

        if (!order) {
            return errorResponse("Order not found or unauthorized", 404);
        }

        const oldStatus = order.status;

        // Use a transaction for atomic stock restoration + order update
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Restore stock if order is being cancelled (and wasn't already cancelled)
            if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
                // Fetch order items with product info
                const orderItems = await tx.orderItem.findMany({
                    where: { orderId },
                    select: {
                        productId: true,
                        quantity: true,
                        selectedVariant: true,
                        product: {
                            select: { variantStock: true }
                        }
                    }
                });

                // Restore stock for each item
                for (const item of orderItems) {
                    if (item.selectedVariant && item.product.variantStock) {
                        // Restore variant stock
                        const variantStockData = typeof item.product.variantStock === 'object'
                            ? item.product.variantStock as Record<string, number>
                            : {};
                        
                        variantStockData[item.selectedVariant] = 
                            (variantStockData[item.selectedVariant] || 0) + item.quantity;

                        await tx.product.update({
                            where: { id: item.productId },
                            data: { variantStock: variantStockData },
                        });
                    } else {
                        // Restore general stock
                        await tx.product.update({
                            where: { id: item.productId },
                            data: {
                                stock: {
                                    increment: item.quantity,
                                },
                            },
                        });
                    }
                }
            }

            // Update order status
            return tx.order.update({
                where: { id: orderId },
                data: { status },
            });
        });

        // Log the status change for audit trail
        logOrderStatusChange(orderId, oldStatus, status, auth.user.id);

        return successResponse(updatedOrder);
    } catch (error) {
        return errorResponse("Failed to update order", 500, error);
    }
}

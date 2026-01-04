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
            include: {
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

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        // Log the status change for audit trail
        logOrderStatusChange(orderId, oldStatus, status, auth.user.id);

        return successResponse(updatedOrder);
    } catch (error) {
        return errorResponse("Failed to update order", 500, error);
    }
}

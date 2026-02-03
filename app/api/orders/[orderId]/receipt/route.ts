import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { sendOrderReceiptEmail } from "@/lib/api/order-receipt";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        // Fetch order with all details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: { email: true },
                },
                address: true,
                items: {
                    include: {
                        product: {
                            select: { name: true, images: true },
                        },
                    },
                },
            },
        });

        if (!order) {
            return errorResponse("Không tìm thấy đơn hàng", 404);
        }

        // Send receipt email (fire and forget - don't block response)
        sendOrderReceiptEmail({
            orderId: order.id,
            email: order.user.email,
            fullName: order.fullName,
            items: order.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: Number(item.price),
                variant: item.selectedVariant || undefined,
                image: item.product.images[0] || undefined,
            })),
            total: Number(order.total),
            address: order.address
                ? {
                    street: order.address.street,
                    city: order.address.city,
                    state: order.address.state || "",
                }
                : undefined,
        }).catch((err: unknown) => console.error("Failed to send receipt email:", err));

        return successResponse({ message: "Receipt email sent" });
    } catch (error) {
        console.error("Failed to send receipt:", error);
        return errorResponse("Không thể gửi email", 500, error);
    }
}

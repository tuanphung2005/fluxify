import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  successResponse,
  isErrorResult,
} from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";

/**
 * GET /api/user/orders
 * Fetch all orders for the authenticated user
 */
export async function GET() {
  try {
    const auth = await getAuthenticatedUser();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const orders = await prisma.order.findMany({
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
    });

    return successResponse(orders);
  } catch (error) {
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
    const auth = await getAuthenticatedUser();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await req.json();
    const validation = cancelOrderSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { orderId } = validation.data;

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    if (order.userId !== auth.user.id) {
      return errorResponse("Unauthorized", 403);
    }

    // Only allow cancellation if PENDING or PROCESSING
    if (order.status !== "PENDING" && order.status !== "PROCESSING") {
      return errorResponse(
        "Order cannot be cancelled. Only pending or processing orders can be cancelled.",
        400,
      );
    }

    // Cancel the order and restore stock atomically
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of order.items) {
        if (item.selectedVariant) {
          // Use raw SQL for atomic variant stock restoration
          await tx.$executeRaw`
                        UPDATE "Product"
                        SET "variantStock" = jsonb_set(
                            COALESCE("variantStock", '{}'::jsonb),
                            ${[item.selectedVariant]}::text[],
                            to_jsonb(
                                COALESCE(("variantStock"->${item.selectedVariant})::int, 0) + ${item.quantity}
                            )
                        )
                        WHERE id = ${item.productId}
                    `;
        } else {
          // General stock uses Prisma's atomic increment
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
    return errorResponse("Failed to cancel order", 500, error);
  }
}

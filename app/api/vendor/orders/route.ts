import { NextRequest } from "next/server";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { isErrorResult } from "@/lib/api/responses";
import { logOrderStatusChange } from "@/lib/api/audit";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedVendor();

    if (isErrorResult(auth)) {
      return errorResponse(auth.error, auth.status);
    }

    // Parse pagination and filter params
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const statusParam = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Validate status is a valid OrderStatus
    const validStatuses = Object.values(OrderStatus);
    const status = statusParam && validStatuses.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined;

    // Build where clause
    const whereClause: Prisma.OrderWhereInput = {
      items: {
        some: {
          product: {
            vendorId: auth.vendor.id,
          },
        },
      },
      ...(status && { status }),
    };

    // Get total count for pagination
    const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    const orders = await prisma.order.findMany({
      where: whereClause,
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
              vendorId: auth.vendor.id,
            },
          },
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalOrders / limit);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    return errorResponse("Failed to fetch orders", 500, error);
  }
}

const updateStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
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
              vendorId: auth.vendor.id,
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse("Order not found or unauthorized", 404);
    }

    const oldStatus = order.status;

    // Use a transaction for atomic stock restoration + order update
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock if order is being cancelled (and wasn't already cancelled)
      if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
        // Fetch order items
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
          select: {
            productId: true,
            quantity: true,
            selectedVariant: true,
          },
        });

        // Restore stock atomically for each item
        for (const item of orderItems) {
          if (item.selectedVariant) {
            // Use raw SQL for atomic variant stock restoration with PostgreSQL jsonb_set
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
            // General stock uses Prisma's atomic increment (already race-safe)
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

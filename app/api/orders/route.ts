import crypto from "crypto";

import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitPresets,
  rateLimitExceededResponse,
} from "@/lib/api/rate-limit";
import { getVariantStockForKey } from "@/lib/variant-utils";
import { updateVariantStock } from "@/lib/db/product-queries";

import { MAX_QUANTITY_PER_ITEM, orderSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  // Apply rate limiting to order creation
  const rateLimit = checkRateLimit(
    getClientIdentifier(req),
    rateLimitPresets.write,
  );

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetTime);
  }

  try {
    const body = await req.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { fullName, phoneNumber, email, items, address } = validation.data;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create user
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        // Generate secure random password for guest users
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "CUSTOMER",
            // emailVerified is null - user must verify to access account
          },
        });
      }

      // 2. Create address
      const newAddress = await tx.address.create({
        data: {
          userId: user.id,
          ...address,
        },
      });

      // 3. Batch fetch all products to avoid N+1 queries
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          stock: true,
          variantStock: true,
          name: true,
          price: true,
        },
      });

      // Create lookup map for O(1) access
      const productMap = new Map(products.map((p) => [p.id, p]));

      // 4. Calculate total and verify products exist with sufficient stock
      let total = 0;
      const stockUpdates: Array<{
        productId: string;
        quantity: number;
        selectedVariant?: string;
      }> = [];

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Check variant stock if variant is selected
        const availableStock = item.selectedVariant
          ? getVariantStockForKey(product.variantStock, item.selectedVariant)
          : product.stock;

        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for product: ${product.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ""}`,
          );
        }

        total += item.price * item.quantity;
        stockUpdates.push({
          productId: item.productId,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant,
        });
      }

      // 4. Create order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          fullName,
          phoneNumber,
          addressId: newAddress.id,
          total,
          status: "PROCESSING",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              selectedVariant: item.selectedVariant,
            })),
          },
        },
      });

      // 5. Update stock atomically (prevents race conditions)
      // 5. Update stock atomically (prevents race conditions)
      for (const update of stockUpdates) {
        await updateVariantStock(
          tx,
          update.productId,
          update.quantity,
          "decrement",
          update.selectedVariant,
        );
      }

      return order;
    });

    return successResponse(result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";

    return errorResponse(message, 500, error);
  }
}

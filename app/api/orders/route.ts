import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { checkRateLimit, getClientIdentifier, rateLimitPresets, rateLimitExceededResponse } from "@/lib/api/rate-limit";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const MAX_QUANTITY_PER_ITEM = 999;

const orderSchema = z.object({
    email: z.string().email(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1).max(MAX_QUANTITY_PER_ITEM, `Maximum ${MAX_QUANTITY_PER_ITEM} items per product`),
        price: z.number().min(0),
    })).min(1, "At least one item is required"),
    address: z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        zipCode: z.string().min(1),
        country: z.string().min(1),
    }),
});

export async function POST(req: NextRequest) {
    // Apply rate limiting to order creation
    const rateLimit = checkRateLimit(getClientIdentifier(req), rateLimitPresets.write);
    if (!rateLimit.allowed) {
        return rateLimitExceededResponse(rateLimit.resetTime);
    }

    try {
        const body = await req.json();
        const validation = orderSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { email, items, address } = validation.data;

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

            // 3. Calculate total and verify products exist with sufficient stock
            let total = 0;
            const stockUpdates: Array<{ productId: string; quantity: number }> = [];

            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { id: true, stock: true, name: true, price: true }
                });

                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }

                total += item.price * item.quantity;
                stockUpdates.push({ productId: item.productId, quantity: item.quantity });
            }

            // 4. Create order
            const order = await tx.order.create({
                data: {
                    userId: user.id,
                    addressId: newAddress.id,
                    total,
                    status: "PROCESSING",
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            });

            // 5. Update stock in batch (within transaction for atomicity)
            for (const update of stockUpdates) {
                await tx.product.update({
                    where: { id: update.productId },
                    data: {
                        stock: {
                            decrement: update.quantity,
                        },
                    },
                });
            }

            return order;
        });

        return successResponse(result, 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create order";
        return errorResponse(message, 500, error);
    }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { z } from "zod";

const orderSchema = z.object({
    email: z.string().email(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
    })),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string(),
    }),
});

export async function POST(req: NextRequest) {
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
                user = await tx.user.create({
                    data: {
                        email,
                        password: "GUEST_USER_PASSWORD_PLACEHOLDER", // In a real app, handle this properly
                        role: "CUSTOMER",
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

            // 3. Calculate total
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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

            // 5. Update stock
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true, name: true }
                });

                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            return order;
        });

        return successResponse(result, 201);
    } catch (error) {
        console.error("Order creation failed:", error);
        return errorResponse("Failed to create order", 500, error);
    }
}

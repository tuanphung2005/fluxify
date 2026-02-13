
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { updateVariantStock } from '@/lib/db/product-queries';

describe('Variant Stock Prevention Integration', () => {
    let vendorId: string;
    let userId: string;
    let productId: string;

    beforeAll(async () => {
        // Setup User and Vendor
        const email = `test-vendor-${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email,
                password: "hash",
                name: "Test Vendor",
                role: "VENDOR"
            }
        });
        userId = user.id;

        const vendorProfile = await prisma.vendorProfile.create({
            data: {
                userId: user.id,
                storeName: "Test Store " + Date.now(),
            }
        });
        vendorId = vendorProfile.id;

        // Create Product
        const product = await prisma.product.create({
            data: {
                name: "Test Stock Product",
                description: "For testing stock logic",
                price: 100,
                stock: 10,
                images: [],
                vendorId: vendorId,
                variants: {
                    "Size": ["S"],
                    "Color": ["Red"]
                },
                variantStock: {
                    "Size:S,Color:Red": 10
                }
            }
        });
        productId = product.id;
    });

    afterAll(async () => {
        // Cleanup
        await prisma.product.deleteMany({ where: { id: productId } });
        await prisma.vendorProfile.deleteMany({ where: { id: vendorId } });
        await prisma.user.deleteMany({ where: { id: userId } });
    });

    it('should allow decrementing stock when sufficient', async () => {
        await prisma.$transaction(async (tx) => {
            await updateVariantStock(tx, productId, 5, "decrement", "Size:S,Color:Red");
        });

        const p = await prisma.product.findUnique({ where: { id: productId } });
        const stock = (p?.variantStock as any)["Size:S,Color:Red"];
        expect(stock).toBe(5);
    });

    it('should throw error when stock is insufficient', async () => {
        // Current stock is 5. Try to decrement 6.
        await expect(
            prisma.$transaction(async (tx) => {
                await updateVariantStock(tx, productId, 6, "decrement", "Size:S,Color:Red");
            })
        ).rejects.toThrow("Insufficient stock for variant: Size:S,Color:Red");

        // Verify stock remains 5
        const p = await prisma.product.findUnique({ where: { id: productId } });
        const stock = (p?.variantStock as any)["Size:S,Color:Red"];
        expect(stock).toBe(5);
    });
});

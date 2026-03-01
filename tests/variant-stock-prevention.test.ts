
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
    user: { create: vi.fn().mockResolvedValue({ id: 'mock-user-id' }), deleteMany: vi.fn() },
    vendorProfile: { create: vi.fn().mockResolvedValue({ id: 'mock-vendor-id' }), deleteMany: vi.fn() },
    product: {
        create: vi.fn().mockResolvedValue({ id: 'mock-product-id' }),
        deleteMany: vi.fn(),
        findUnique: vi.fn().mockResolvedValue({
            id: 'mock-product-id',
            variantStock: { "Size:S,Color:Red": 5 }
        })
    },
    $transaction: vi.fn().mockImplementation((cb) => cb({
        product: {
            findUnique: vi.fn().mockResolvedValue({
                id: 'mock-product-id',
                variantStock: { "Size:S,Color:Red": 5 }
            }),
            update: vi.fn()
        },
        $executeRaw: vi.fn().mockResolvedValue(1),
        $queryRaw: vi.fn(),
    }))
}));

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma
}));

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
        // Override mock for this test
        (prisma.$transaction as any).mockImplementation((cb: any) => cb({
            product: { findUnique: vi.fn(), update: vi.fn() },
            $executeRaw: vi.fn().mockResolvedValue(0)
        }));

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

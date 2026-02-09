import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockTx = {
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
    },
    address: {
        create: vi.fn(),
    },
    product: {
        findMany: vi.fn(),
    },
    order: {
        create: vi.fn(),
    },
};

const mockPrisma = {
    $transaction: vi.fn((callback) => callback(mockTx)),
};

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}));

vi.mock('@/lib/api/rate-limit', () => ({
    checkRateLimit: () => ({ allowed: true }),
    getClientIdentifier: () => 'test-client',
    rateLimitPresets: { write: {} },
    rateLimitExceededResponse: () => ({ status: 429 }),
}));

// Mock responses
vi.mock('@/lib/api/responses', () => ({
    successResponse: (data: any) => ({ status: 201, json: () => Promise.resolve(data) }),
    errorResponse: (msg: string, status: number) => ({ status, json: () => Promise.resolve({ error: msg }) }),
}));

// Mock validations
vi.mock('@/lib/validations', () => ({
    orderSchema: {
        safeParse: (body: any) => ({
            success: true,
            data: body,
        }),
    },
    MAX_QUANTITY_PER_ITEM: 999,
}));

// Import the route handler
import { POST } from '@/app/api/orders/route';

describe('Order Price Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use database price instead of request price', async () => {
        // Setup
        const productPrice = 100;
        const manipulatedPrice = 0.01;
        const quantity = 2;

        const requestBody = {
            fullName: 'Test User',
            email: 'test@example.com',
            items: [
                { productId: 'p1', quantity, price: manipulatedPrice }
            ],
            address: {}
        };

        const req = {
            json: async () => requestBody,
        } as unknown as NextRequest;

        // Mock DB calls
        mockTx.user.findUnique.mockResolvedValue({ id: 'user1' });
        mockTx.address.create.mockResolvedValue({ id: 'addr1' });
        mockTx.product.findMany.mockResolvedValue([
            { id: 'p1', price: productPrice, stock: 10, variantStock: {}, name: 'Product 1' }
        ]);
        mockTx.order.create.mockResolvedValue({ id: 'order1', total: productPrice * quantity });

        // Execute
        await POST(req);

        // Verify
        // 1. Total should be calculated using productPrice (100 * 2 = 200)
        expect(mockTx.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                total: 200,
            })
        }));

        // 2. Order items should use productPrice (100)
        expect(mockTx.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                items: {
                    create: expect.arrayContaining([
                        expect.objectContaining({
                            price: productPrice,
                        })
                    ])
                }
            })
        }));

        // Ensure manipulated price was NOT used
        const createCall = mockTx.order.create.mock.calls[0][0];
        const createdItem = createCall.data.items.create[0];
        expect(createdItem.price).not.toBe(manipulatedPrice);
    });
});

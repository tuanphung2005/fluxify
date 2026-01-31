import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockPrisma = {
    chatConversation: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    chatMessage: {
        create: vi.fn(),
        findMany: vi.fn(),
        updateMany: vi.fn(),
    },
    user: {
        findUnique: vi.fn(),
    },
};

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
    checkRateLimit: () => ({ allowed: true }),
    getClientIdentifier: () => 'test-client',
    rateLimitPresets: { write: {} },
}));

vi.mock('@/lib/api/responses', () => ({
    successResponse: (data: any) => ({ status: 201, json: () => Promise.resolve(data) }),
    errorResponse: (msg: string, status: number) => ({ status, json: () => Promise.resolve({ error: msg }) }),
}));

import { POST } from '@/app/api/chat/conversations/[id]/messages/route';
import { auth } from '@/lib/auth';

describe('Chat Message Sanitization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default auth mock
        (auth as any).mockResolvedValue({
            user: { email: 'test@example.com' }
        });
        // Setup default user mock
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user1',
            email: 'test@example.com',
            vendorProfile: null
        });
        // Setup default conversation mock
        mockPrisma.chatConversation.findUnique.mockResolvedValue({
            id: 'conv1',
            userId: 'user1',
            vendorId: 'vendor1'
        });
    });

    const createRequest = (content: string) => {
        return {
            json: async () => ({ content }),
        } as unknown as NextRequest;
    };

    const routeParams = { params: Promise.resolve({ id: 'conv1' }) };

    it('should strip script tags', async () => {
        const maliciousContent = 'Hello <script>alert("xss")</script> World';

        await POST(createRequest(maliciousContent), routeParams);

        expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                content: 'Hello  World'
            })
        }));
    });

    it('should preserve allowed rich text tags', async () => {
        const richContent = '<p><strong>Bold</strong> and <em>Italic</em> and <a href="https://example.com">Link</a></p>';

        await POST(createRequest(richContent), routeParams);

        expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                content: richContent
            })
        }));
    });

    it('should allow headings and lists', async () => {
        const content = '<h1>Title</h1><ul><li>Item 1</li></ul>';

        await POST(createRequest(content), routeParams);

        expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                content: content
            })
        }));
    });

    it('should remove disallowed attributes', async () => {
        const content = '<a href="http://site.com" onclick="stealData()">Click me</a>';

        await POST(createRequest(content), routeParams);

        expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                content: '<a href="http://site.com">Click me</a>'
            })
        }));
    });

    it('should reject empty content after sanitization', async () => {
        const content = '<script>alert("xss")</script>'; // Becomes empty string

        const response = await POST(createRequest(content), routeParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Nội dung tin nhắn không hợp lệ');
        expect(mockPrisma.chatMessage.create).not.toHaveBeenCalled();
    });
});

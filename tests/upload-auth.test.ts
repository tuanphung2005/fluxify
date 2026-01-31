import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/api/auth-helpers', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/cloudinary', () => ({
    uploadToCloudinary: vi.fn(),
}));

import { getAuthenticatedUser } from '@/lib/api/auth-helpers';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { POST } from '@/app/api/upload/route';

describe('Upload Endpoint Authentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        // Mock unauthorized result
        (getAuthenticatedUser as any).mockResolvedValue({ error: 'Unauthorized', status: 401 });

        const req = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized access');
        expect(uploadToCloudinary).not.toHaveBeenCalled();
    });

    it('should proceed if user is authenticated', async () => {
        // Mock authorized result
        (getAuthenticatedUser as any).mockResolvedValue({
            user: { id: 'user1', email: 'test@example.com', role: 'CUSTOMER' }
        });

        // Mock successful upload
        (uploadToCloudinary as any).mockResolvedValue({
            secure_url: 'https://cloudinary.com/image.jpg',
            public_id: 'image123',
            width: 100,
            height: 100
        });

        // Create form data
        const formData = new FormData();
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        formData.append('file', file);

        const req = {
            formData: async () => formData
        } as unknown as NextRequest;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.url).toBe('https://cloudinary.com/image.jpg');
        expect(uploadToCloudinary).toHaveBeenCalled();
    });
});


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Variable Validation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Cloudinary Configuration', () => {
        it('should warn in dev when Cloudinary env vars are missing', async () => {
            delete process.env.CLOUDINARY_CLOUD_NAME;
            delete process.env.CLOUDINARY_API_KEY;
            delete process.env.CLOUDINARY_API_SECRET;
            process.env.NODE_ENV = 'development';

            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            await import('@/lib/cloudinary');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Missing required Cloudinary environment variables')
            );

            warnSpy.mockRestore();
        });

        it('should throw in production when Cloudinary env vars are missing', async () => {
            delete process.env.CLOUDINARY_CLOUD_NAME;
            delete process.env.CLOUDINARY_API_KEY;
            delete process.env.CLOUDINARY_API_SECRET;
            process.env.NODE_ENV = 'production';

            await expect(import('@/lib/cloudinary')).rejects.toThrow(
                'Missing required Cloudinary environment variables'
            );
        });
    });

    describe('Email Service Configuration', () => {
        it('should warn in dev when RESEND_API_KEY is missing', async () => {
            delete process.env.RESEND_API_KEY;
            process.env.NODE_ENV = 'development';

            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            await import('@/lib/api/email-verification');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('RESEND_API_KEY is not set')
            );

            warnSpy.mockRestore();
        });

        it('should throw in production when RESEND_API_KEY is missing', async () => {
            delete process.env.RESEND_API_KEY;
            process.env.NODE_ENV = 'production';

            await expect(import('@/lib/api/email-verification')).rejects.toThrow(
                'Missing required environment variable: RESEND_API_KEY'
            );
        });
    });
});

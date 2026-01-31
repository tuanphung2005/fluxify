import crypto from "crypto";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1; // 1 hour for security
const RESEND_COOLDOWN_SECONDS = 60;

// Lazy-initialize Resend to avoid build-time errors
let resend: Resend | null = null;
function getResend(): Resend {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

/**
 * Generate a secure password reset token
 */
export function generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Check if user can request a new password reset email (60s cooldown)
 * Returns seconds remaining if on cooldown, 0 if can resend
 */
export async function getPasswordResetCooldown(email: string): Promise<number> {
    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { identifier: email },
        select: { expires: true, createdAt: true },
    });

    if (!existingToken) return 0;

    const secondsSinceCreation = Math.floor(
        (Date.now() - existingToken.createdAt.getTime()) / 1000
    );

    if (secondsSinceCreation < RESEND_COOLDOWN_SECONDS) {
        return RESEND_COOLDOWN_SECONDS - secondsSinceCreation;
    }

    return 0;
}

/**
 * Create a password reset token for a user
 * Returns null if on cooldown
 */
export async function createPasswordResetToken(
    email: string
): Promise<{ token: string } | { cooldownRemaining: number } | { error: string }> {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (!user) {
        // Don't reveal if user exists or not for security
        return { token: "fake" }; // Return fake success
    }

    // Check cooldown
    const cooldown = await getPasswordResetCooldown(email);
    if (cooldown > 0) {
        return { cooldownRemaining: cooldown };
    }

    const token = generatePasswordResetToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
        where: { identifier: email },
    });

    // Create new token
    await prisma.passwordResetToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return { token };
}

/**
 * Verify a password reset token and reset the password
 */
export async function verifyPasswordResetToken(
    email: string,
    token: string
): Promise<{ success: boolean; error?: string }> {
    const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
            identifier: email,
            token,
        },
    });

    if (!resetToken) {
        return { success: false, error: "Link đặt lại mật khẩu không hợp lệ" };
    }

    if (new Date() > resetToken.expires) {
        // Clean up expired token
        await prisma.passwordResetToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token,
                },
            },
        });

        return { success: false, error: "Link đặt lại mật khẩu đã hết hạn" };
    }

    return { success: true };
}

/**
 * Complete the password reset process
 */
export async function resetPassword(
    email: string,
    token: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    // Verify token first
    const verification = await verifyPasswordResetToken(email, token);
    if (!verification.success) {
        return verification;
    }

    // Import bcrypt here to avoid issues
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and get user ID
    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
        select: { id: true },
    });

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
        where: { userId: user.id },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
        where: {
            identifier_token: {
                identifier: email,
                token,
            },
        },
    });

    return { success: true };
}

/**
 * Get password reset URL for email
 */
export function getPasswordResetUrl(email: string, token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Send password reset email using Resend
 */
export async function sendPasswordResetEmail(
    email: string,
    token: string
): Promise<void> {
    const resetUrl = getPasswordResetUrl(email, token);

    // In development without API key, just log
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_test") {
        console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
        return;
    }

    try {
        await getResend().emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Fluxify <onboarding@phungtuan.io.vn>",
            to: email,
            subject: "Đặt lại mật khẩu - Fluxify",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Đặt lại mật khẩu</h1>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tạo mật khẩu mới.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Đặt lại mật khẩu
            </a>
            <p style="color: #a1a1aa; font-size: 14px; margin: 24px 0 0;">
              Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
          </div>
        </body>
        </html>
      `,
        });
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
    }
}

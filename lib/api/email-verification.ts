import crypto from "crypto";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
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
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Check if user can request a new verification email (60s cooldown)
 * Returns seconds remaining if on cooldown, 0 if can resend
 */
export async function getResendCooldown(email: string): Promise<number> {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    select: { expires: true },
  });

  if (!existingToken) return 0;

  // Calculate when the token was created based on expiry
  const tokenCreatedAt = new Date(existingToken.expires);
  tokenCreatedAt.setHours(tokenCreatedAt.getHours() - VERIFICATION_TOKEN_EXPIRY_HOURS);

  const secondsSinceCreation = Math.floor(
    (Date.now() - tokenCreatedAt.getTime()) / 1000
  );

  if (secondsSinceCreation < RESEND_COOLDOWN_SECONDS) {
    return RESEND_COOLDOWN_SECONDS - secondsSinceCreation;
  }

  return 0;
}

/**
 * Create an email verification token for a user
 * Returns null if on cooldown
 */
export async function createVerificationToken(
  email: string,
  bypassCooldown = false
): Promise<{ token: string } | { cooldownRemaining: number }> {
  // Check cooldown unless bypassed (e.g., during registration)
  if (!bypassCooldown) {
    const cooldown = await getResendCooldown(email);
    if (cooldown > 0) {
      return { cooldownRemaining: cooldown };
    }
  }

  const token = generateVerificationToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return { token };
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
    },
  });

  if (!verificationToken) {
    return { success: false, error: "Invalid verification token" };
  }

  if (new Date() > verificationToken.expires) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return { success: false, error: "Verification token has expired" };
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
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
 * Check if a user's email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  return !!user?.emailVerified;
}

/**
 * Get verification URL for email
 */
export function getVerificationUrl(email: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${baseUrl}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Send verification email using Resend
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = getVerificationUrl(email, token);

  // In development without API key, just log
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_test") {
    return;
  }

  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Fluxify <onboarding@phungtuan.io.vn>",
      to: email,
      subject: "Xác thực email của bạn - Fluxify",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Xác thực email của bạn</h1>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Cảm ơn bạn đã đăng ký! Vui lòng nhấn nút bên dưới để xác thực địa chỉ email của bạn.
            </p>
            <a href="${verificationUrl}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Xác thực email
            </a>
            <p style="color: #a1a1aa; font-size: 14px; margin: 24px 0 0;">
              Link này sẽ hết hạn sau 24 giờ. Nếu bạn không yêu cầu xác thực này, vui lòng bỏ qua email này.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

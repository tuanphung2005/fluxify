import crypto from "crypto";

import { prisma } from "@/lib/prisma";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create an email verification token for a user
 */
export async function createVerificationToken(email: string): Promise<string> {
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

  return token;
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(
  email: string,
  token: string,
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
 * In production, this would be sent via email service
 */
export function getVerificationUrl(email: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${baseUrl}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Mock email sending function
 * Replace with actual email service (SendGrid, Resend, etc.) in production
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verificationUrl = getVerificationUrl(email, token);

  // In production, use an email service:
  // await resend.emails.send({
  //     from: "noreply@fluxify.com",
  //     to: email,
  //     subject: "Verify your email",
  //     html: `<a href="${verificationUrl}">Click here to verify your email</a>`,
  // });

  // For development, log the URL
  console.log(`\n📧 Verification email for ${email}:`);
  console.log(`   URL: ${verificationUrl}\n`);
}

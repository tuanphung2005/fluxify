import { NextRequest } from "next/server";
import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api/responses";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitPresets,
  rateLimitExceededResponse,
} from "@/lib/api/rate-limit";
import {
  verifyEmailToken,
  createVerificationToken,
  sendVerificationEmail,
  isEmailVerified,
} from "@/lib/api/email-verification";
import { prisma } from "@/lib/prisma";

const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

const resendSchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/auth/verify - Verify email with token
 */
export async function POST(req: NextRequest) {
  // Rate limit verification attempts
  const rateLimit = checkRateLimit(
    getClientIdentifier(req),
    rateLimitPresets.auth,
  );

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetTime);
  }

  try {
    const body = await req.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { email, token } = validation.data;

    const result = await verifyEmailToken(email, token);

    if (!result.success) {
      return errorResponse(result.error || "Verification failed", 400);
    }

    return successResponse({ message: "Email verified successfully" });
  } catch (error) {
    return errorResponse("Verification failed", 500, error);
  }
}

/**
 * PUT /api/auth/verify - Resend verification email
 */
export async function PUT(req: NextRequest) {
  // Strict rate limit for resend
  const rateLimit = checkRateLimit(
    `resend:${getClientIdentifier(req)}`,
    { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  );

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetTime);
  }

  try {
    const body = await req.json();
    const validation = resendSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (!user) {
      // Don't reveal if user exists
      return successResponse({
        message: "If the email exists, a verification link has been sent",
      });
    }

    if (user.emailVerified) {
      return errorResponse("Email is already verified", 400);
    }

    // Create and send new token
    const token = await createVerificationToken(email);

    await sendVerificationEmail(email, token);

    return successResponse({ message: "Verification email sent" });
  } catch (error) {
    return errorResponse("Failed to send verification email", 500, error);
  }
}

/**
 * GET /api/auth/verify - Check verification status
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return errorResponse("Email is required", 400);
  }

  try {
    const verified = await isEmailVerified(email);

    return successResponse({ verified });
  } catch (error) {
    return errorResponse("Failed to check verification status", 500, error);
  }
}

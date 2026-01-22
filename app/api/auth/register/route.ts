import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitPresets,
  rateLimitExceededResponse,
} from "@/lib/api/rate-limit";
import { errorResponse, successResponse } from "@/lib/api/responses";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "@/lib/api/email-verification";

/**
 * Password validation schema with security requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
});

export async function POST(req: NextRequest) {
  // Apply strict rate limiting to auth endpoints
  const rateLimit = checkRateLimit(
    getClientIdentifier(req),
    rateLimitPresets.auth,
  );

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetTime);
  }

  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse("User already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        // emailVerified is null - requires verification
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // If vendor, create vendor profile
    if (validatedData.role === "VENDOR") {
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          storeName: validatedData.name || "My Store",
        },
      });
    }

    // Send verification email
    const token = await createVerificationToken(user.email);

    await sendVerificationEmail(user.email, token);

    return successResponse(
      {
        message:
          "User created successfully. Please check your email to verify your account.",
        user,
        requiresVerification: true,
      },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    return errorResponse("Registration failed", 500, error);
  }
}

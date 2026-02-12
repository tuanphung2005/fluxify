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
  .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết thường")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số");

const registerSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: passwordSchema,
  name: z.string().min(2, "Tên phải chứa ít nhất 2 ký tự").optional(),
  role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
});

export async function POST(req: NextRequest) {
  // auth rate limit 
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

    // check user ton tai
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse("Người dùng đã tồn tại", 400);
    }

    // hash pw
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // new user
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

    // if vendor
    if (validatedData.role === "VENDOR") {
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          storeName: validatedData.name || "Cửa hàng của tôi",
        },
      });
    }

    // Send verification email (bypass cooldown for new registration)
    const tokenResult = await createVerificationToken(user.email, true);

    if ('token' in tokenResult) {
      await sendVerificationEmail(user.email, tokenResult.token);
    }

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

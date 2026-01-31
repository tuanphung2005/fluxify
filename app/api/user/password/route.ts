import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import {
    checkRateLimit,
    getClientIdentifier,
    rateLimitExceededResponse,
} from "@/lib/api/rate-limit";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/**
 * PATCH /api/user/password - Change user's password
 */
export async function PATCH(req: NextRequest) {
    // Rate limit password change attempts
    const rateLimit = checkRateLimit(getClientIdentifier(req), {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 attempts per 15 minutes
    });

    if (!rateLimit.allowed) {
        return rateLimitExceededResponse(rateLimit.resetTime);
    }

    try {
        const session = await auth();

        if (!session?.user?.email) {
            return errorResponse("Chưa xác thực", 401);
        }

        const body = await req.json();
        const validation = changePasswordSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { currentPassword, newPassword } = validation.data;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, password: true },
        });

        if (!user || !user.password) {
            return errorResponse("User not found or no password set", 404);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password,
        );

        if (!isCurrentPasswordValid) {
            return errorResponse("Mật khẩu hiện tại không đúng", 400);
        }

        // Check if new password is different from current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
            return errorResponse(
                "Mật khẩu mới phải khác mật khẩu hiện tại",
                400,
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return successResponse({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        return errorResponse("Không thể đổi mật khẩu", 500, error);
    }
}

import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import {
    checkRateLimit,
    getClientIdentifier,
    rateLimitExceededResponse,
} from "@/lib/api/rate-limit";
import {
    createPasswordResetToken,
    sendPasswordResetEmail,
    resetPassword,
} from "@/lib/api/password-reset";

const requestResetSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z
    .object({
        email: z.string().email(),
        token: z.string().min(1),
        newPassword: z
            .string()
            .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
            ),
        confirmPassword: z.string().min(1),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

/**
 * POST /api/user/password - Request password reset email
 */
export async function POST(req: NextRequest) {
    // Rate limit password reset requests
    const rateLimit = checkRateLimit(getClientIdentifier(req), {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 attempts per 15 minutes
    });

    if (!rateLimit.allowed) {
        return rateLimitExceededResponse(rateLimit.resetTime);
    }

    try {
        const body = await req.json();
        const validation = requestResetSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { email } = validation.data;

        const result = await createPasswordResetToken(email);

        if ("cooldownRemaining" in result) {
            return errorResponse(
                `Vui lòng đợi ${result.cooldownRemaining} giây trước khi gửi lại`,
                429,
            );
        }

        if ("error" in result) {
            return errorResponse(result.error, 400);
        }

        // Check if this is a real token (user exists)
        if (result.token !== "fake") {
            await sendPasswordResetEmail(email, result.token);
        }

        // Always return success to not reveal if user exists
        return successResponse({
            message: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu",
        });
    } catch (error) {
        return errorResponse("Không thể gửi email đặt lại mật khẩu", 500, error);
    }
}

/**
 * PATCH /api/user/password - Reset password with token
 */
export async function PATCH(req: NextRequest) {
    // Rate limit password reset attempts
    const rateLimit = checkRateLimit(getClientIdentifier(req), {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 attempts per 15 minutes
    });

    if (!rateLimit.allowed) {
        return rateLimitExceededResponse(rateLimit.resetTime);
    }

    try {
        const body = await req.json();
        const validation = resetPasswordSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { email, token, newPassword } = validation.data;

        const result = await resetPassword(email, token, newPassword);

        if (!result.success) {
            return errorResponse(result.error || "Đặt lại mật khẩu thất bại", 400);
        }

        return successResponse({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
        return errorResponse("Không thể đặt lại mật khẩu", 500, error);
    }
}

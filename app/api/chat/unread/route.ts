import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";

/**
 * GET /api/chat/unread
 * Get total unread message count for the current user
 * Query params:
 * - role: "user" | "vendor" (which role to check unread for)
 */
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { vendorProfile: true },
        });

        if (!user) {
            return errorResponse("User not found", 404);
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        let unreadCount = 0;

        if (role === "vendor" && user.vendorProfile) {
            // Count unread messages for vendor (from users)
            unreadCount = await prisma.chatMessage.count({
                where: {
                    conversation: {
                        vendorId: user.vendorProfile.id,
                    },
                    senderType: "USER",
                    isRead: false,
                },
            });
        } else {
            // Count unread messages for user (from vendors)
            unreadCount = await prisma.chatMessage.count({
                where: {
                    conversation: {
                        userId: user.id,
                    },
                    senderType: "VENDOR",
                    isRead: false,
                },
            });
        }

        return successResponse({ unreadCount });
    } catch (error) {
        return errorResponse("Failed to get unread count", 500, error);
    }
}

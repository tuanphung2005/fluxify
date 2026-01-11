import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { NextRequest } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/chat/conversations/[id]
 * Get conversation details
 */
export async function GET(request: NextRequest, props: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return errorResponse("Chưa xác thực", 401);
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { vendorProfile: true },
        });

        if (!user) {
            return errorResponse("Không tìm thấy người dùng", 404);
        }

        const params = await props.params;
        const conversationId = params.id;

        const conversation = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        storeName: true,
                        favicon: true,
                        userId: true,
                    },
                },
            },
        });

        if (!conversation) {
            return errorResponse("Không tìm thấy cuộc trò chuyện", 404);
        }

        // Check if user has access to this conversation
        const isCustomer = conversation.userId === user.id;
        const isVendor = user.vendorProfile?.id === conversation.vendorId;

        if (!isCustomer && !isVendor) {
            return errorResponse("Không có quyền truy cập", 403);
        }

        return successResponse({
            conversation: {
                id: conversation.id,
                customer: {
                    id: conversation.user.id,
                    name: conversation.user.name || conversation.user.email,
                    image: conversation.user.image,
                },
                vendor: {
                    id: conversation.vendor.id,
                    storeName: conversation.vendor.storeName,
                    favicon: conversation.vendor.favicon,
                },
                createdAt: conversation.createdAt,
            },
            role: isVendor ? "vendor" : "user",
        });
    } catch (error) {
        console.error("Failed to fetch conversation:", error);
        return errorResponse("Không thể lấy cuộc trò chuyện", 500, error);
    }
}

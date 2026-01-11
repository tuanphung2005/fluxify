import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { checkRateLimit, getClientIdentifier, rateLimitPresets, rateLimitExceededResponse } from "@/lib/api/rate-limit";
import { NextRequest } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/chat/conversations/[id]/messages
 * Get messages for a conversation
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

        // Verify conversation exists and user has access
        const conversation = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) {
            return errorResponse("Không tìm thấy cuộc trò chuyện", 404);
        }

        const isCustomer = conversation.userId === user.id;
        const isVendor = user.vendorProfile?.id === conversation.vendorId;

        if (!isCustomer && !isVendor) {
            return errorResponse("Không có quyền truy cập", 403);
        }

        // Parse pagination params
        const searchParams = request.nextUrl.searchParams;
        const cursor = searchParams.get("cursor");
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

        // Fetch messages
        const messages = await prisma.chatMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
        });

        // Check if there are more messages
        const hasMore = messages.length > limit;
        if (hasMore) {
            messages.pop();
        }

        // Mark messages as read
        const senderTypeToMark = isVendor ? "USER" : "VENDOR";
        await prisma.chatMessage.updateMany({
            where: {
                conversationId,
                senderType: senderTypeToMark,
                isRead: false,
            },
            data: { isRead: true },
        });

        return successResponse({
            messages: messages.reverse(), // Return in chronological order
            hasMore,
            nextCursor: hasMore ? messages[messages.length - 1]?.id : null,
        });
    } catch (error) {
        return errorResponse("Không thể lấy tin nhắn", 500, error);
    }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Send a new message
 */
export async function POST(request: NextRequest, props: RouteParams) {
    // Rate limit message sending
    const rateLimit = checkRateLimit(getClientIdentifier(request), rateLimitPresets.write);
    if (!rateLimit.allowed) {
        return rateLimitExceededResponse(rateLimit.resetTime);
    }

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

        // Verify conversation exists and user has access
        const conversation = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) {
            return errorResponse("Không tìm thấy cuộc trò chuyện", 404);
        }

        const isCustomer = conversation.userId === user.id;
        const isVendor = user.vendorProfile?.id === conversation.vendorId;

        if (!isCustomer && !isVendor) {
            return errorResponse("Không có quyền truy cập", 403);
        }

        const body = await request.json();
        const { content } = body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return errorResponse("Nội dung tin nhắn không hợp lệ", 400);
        }

        if (content.length > 2000) {
            return errorResponse("Tin nhắn quá dài (tối đa 2000 ký tự)", 400);
        }

        // Create the message
        const message = await prisma.chatMessage.create({
            data: {
                conversationId,
                senderId: user.id,
                senderType: isVendor ? "VENDOR" : "USER",
                content: content.trim(),
            },
        });

        // Update conversation's updatedAt
        await prisma.chatConversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return successResponse({ message }, 201);
    } catch (error) {
        return errorResponse("Không thể gửi tin nhắn", 500, error);
    }
}

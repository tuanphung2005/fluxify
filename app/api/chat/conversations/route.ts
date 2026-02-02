import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitPresets,
  rateLimitExceededResponse,
} from "@/lib/api/rate-limit";

/**
 * GET /api/chat/conversations
 * List all conversations for the current user
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role"); // "user" || "vendor"

    let conversations;

    if (role === "vendor" && user.vendorProfile) {
      // Get conversations where this user is the vendor
      conversations = await prisma.chatConversation.findMany({
        where: { vendorId: user.vendorProfile.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  senderType: "USER",
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return successResponse({
        conversations: conversations.map((conv) => ({
          id: conv.id,
          customer: {
            id: conv.user.id,
            name: conv.user.name || conv.user.email,
            image: conv.user.image,
          },
          lastMessage: conv.messages[0] || null,
          unreadCount: conv._count.messages,
          updatedAt: conv.updatedAt,
        })),
      });
    } else {
      // Get conversations where this user is the customer
      conversations = await prisma.chatConversation.findMany({
        where: { userId: user.id },
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              favicon: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  senderType: "VENDOR",
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return successResponse({
        conversations: conversations.map((conv) => ({
          id: conv.id,
          vendor: {
            id: conv.vendor.id,
            storeName: conv.vendor.storeName,
            favicon: conv.vendor.favicon,
          },
          lastMessage: conv.messages[0] || null,
          unreadCount: conv._count.messages,
          updatedAt: conv.updatedAt,
        })),
      });
    }
  } catch (error) {
    return errorResponse("Không thể lấy danh sách cuộc trò chuyện", 500, error);
  }
}

/**
 * POST /api/chat/conversations
 * Start a new conversation with a vendor or get existing one
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const rateLimit = checkRateLimit(
    getClientIdentifier(request),
    rateLimitPresets.write,
  );

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
    });

    if (!user) {
      return errorResponse("Không tìm thấy người dùng", 404);
    }

    const body = await request.json();
    const { vendorId } = body;

    if (!vendorId) {
      return errorResponse("Thiếu vendorId", 400);
    }

    // Check if vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return errorResponse("Không tìm thấy cửa hàng", 404);
    }

    // if user chat with their own shop -> ignore
    if (vendor.userId === user.id) {
      return errorResponse(
        "Không thể trò chuyện với cửa hàng của chính bạn",
        400,
      );
    }

    // Find existing conversation or create new one
    let conversation = await prisma.chatConversation.findUnique({
      where: {
        userId_vendorId: {
          userId: user.id,
          vendorId: vendorId,
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            favicon: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId: user.id,
          vendorId: vendorId,
        },
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              favicon: true,
            },
          },
        },
      });
    }

    return successResponse({
      conversation: {
        id: conversation.id,
        vendor: conversation.vendor,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    return errorResponse("Không thể bắt đầu cuộc trò chuyện", 500, error);
  }
}

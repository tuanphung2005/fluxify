"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import ChatModal from "./ChatModal";

import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

interface ChatButtonProps {
  vendorId: string;
}

export default function ChatButton({ vendorId }: ChatButtonProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check for existing conversation and unread messages
  useEffect(() => {
    const checkExistingConversation = async () => {
      if (status !== "authenticated") return;

      try {
        const data = await api.get<{
          conversations: Array<{
            id: string;
            vendor: { id: string };
            unreadCount: number;
          }>;
        }>("/api/chat/conversations?role=user");

        const existing = data.conversations.find(
          (conv) => conv.vendor.id === vendorId,
        );

        if (existing) {
          setConversationId(existing.id);
          setUnreadCount(existing.unreadCount);
        }
      } catch (error) {
        console.error("Failed to check conversation:", error);
      }
    };

    checkExistingConversation();
  }, [vendorId, status]);

  const handleOpenChat = useCallback(async () => {
    if (status !== "authenticated") {
      toast.error("Vui lòng đăng nhập để trò chuyện");

      return;
    }

    if (conversationId) {
      setIsOpen(true);
      setUnreadCount(0); // Clear unread count when opening

      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post<{
        conversation: { id: string };
      }>("/api/chat/conversations", { vendorId });

      setConversationId(data.conversation.id);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to start chat:", error);
      toast.error("Không thể bắt đầu cuộc trò chuyện");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, vendorId, status]);

  return (
    <>
      <Badge
        color="danger"
        content={unreadCount}
        isInvisible={unreadCount === 0}
        placement="top-right"
      >
        <Button
          isIconOnly
          aria-label="Trò chuyện với cửa hàng"
          className="shadow-lg"
          color="secondary"
          isLoading={isLoading}
          size="lg"
          variant="solid"
          onPress={handleOpenChat}
        >
          <MessageCircle size={24} />
        </Button>
      </Badge>

      {conversationId && (
        <ChatModal
          conversationId={conversationId}
          isOpen={isOpen}
          vendorId={vendorId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

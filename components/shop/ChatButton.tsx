"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";
import ChatModal from "./ChatModal";

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
                    (conv) => conv.vendor.id === vendorId
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
                content={unreadCount}
                color="danger"
                isInvisible={unreadCount === 0}
                placement="top-right"
            >
                <Button
                    isIconOnly
                    color="secondary"
                    variant="solid"
                    size="lg"
                    className="shadow-lg"
                    onPress={handleOpenChat}
                    isLoading={isLoading}
                    aria-label="Trò chuyện với cửa hàng"
                >
                    <MessageCircle size={24} />
                </Button>
            </Badge>

            {conversationId && (
                <ChatModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    conversationId={conversationId}
                    vendorId={vendorId}
                />
            )}
        </>
    );
}

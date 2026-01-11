"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Input,
    Avatar,
    Spinner,
} from "@heroui/react";
import { Send, Store } from "lucide-react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

interface Message {
    id: string;
    senderId: string;
    senderType: "USER" | "VENDOR";
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface ConversationDetails {
    id: string;
    vendor: {
        id: string;
        storeName: string;
        favicon: string | null;
    };
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    vendorId: string;
}

const POLL_INTERVAL = 3000; // Poll every 3 seconds

export default function ChatModal({
    isOpen,
    onClose,
    conversationId,
    vendorId,
}: ChatModalProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [conversation, setConversation] = useState<ConversationDetails | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const fetchMessages = useCallback(async () => {
        try {
            const data = await api.get<{ messages: Message[] }>(
                `/api/chat/conversations/${conversationId}/messages`
            );
            setMessages(data.messages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }, [conversationId]);

    const fetchConversation = useCallback(async () => {
        try {
            const data = await api.get<{ conversation: ConversationDetails }>(
                `/api/chat/conversations/${conversationId}`
            );
            setConversation(data.conversation);
        } catch (error) {
            console.error("Failed to fetch conversation:", error);
        }
    }, [conversationId]);

    // Initial load
    useEffect(() => {
        if (isOpen && conversationId) {
            setIsLoading(true);
            Promise.all([fetchConversation(), fetchMessages()]).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen, conversationId, fetchConversation, fetchMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Polling for new messages
    useEffect(() => {
        if (isOpen && conversationId) {
            pollIntervalRef.current = setInterval(fetchMessages, POLL_INTERVAL);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [isOpen, conversationId, fetchMessages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setNewMessage("");
        setIsSending(true);

        try {
            const data = await api.post<{ message: Message }>(
                `/api/chat/conversations/${conversationId}/messages`,
                { content }
            );

            setMessages((prev) => [...prev, data.message]);
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Không thể gửi tin nhắn");
            setNewMessage(content); // Restore message on error
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleGoToShop = () => {
        router.push(`/shop/${vendorId}`);
        onClose();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Hôm nay";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hôm qua";
        }
        return date.toLocaleDateString("vi-VN");
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, Message[]>);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            scrollBehavior="inside"
            classNames={{
                wrapper: "z-[100]",
            }}
        >
            <ModalContent className="h-[70vh] max-h-[600px]">
                <ModalHeader className="flex items-center gap-3 border-b">
                    <Avatar
                        src={conversation?.vendor.favicon || undefined}
                        name={conversation?.vendor.storeName}
                        size="sm"
                    />
                    <div className="flex-1">
                        <p className="font-semibold">
                            {conversation?.vendor.storeName || "Đang tải..."}
                        </p>
                        <p className="text-xs text-default-400">Cửa hàng</p>
                    </div>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={handleGoToShop}
                        aria-label="Đi đến cửa hàng"
                    >
                        <Store size={18} />
                    </Button>
                </ModalHeader>

                <ModalBody className="p-0 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-default-400 py-8">
                                        <p>Bắt đầu cuộc trò chuyện với cửa hàng!</p>
                                    </div>
                                ) : (
                                    Object.entries(groupedMessages).map(([date, msgs]) => (
                                        <div key={date}>
                                            <div className="text-center text-xs text-default-400 mb-4">
                                                {formatDate(msgs[0].createdAt)}
                                            </div>
                                            <div className="space-y-2">
                                                {msgs.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${
                                                            message.senderType === "USER"
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                                                message.senderType === "USER"
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-default-100"
                                                            }`}
                                                        >
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                            <p
                                                                className={`text-xs mt-1 ${
                                                                    message.senderType === "USER"
                                                                        ? "text-primary-foreground/70"
                                                                        : "text-default-400"
                                                                }`}
                                                            >
                                                                {formatTime(message.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t bg-content1">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        classNames={{
                                            inputWrapper: "bg-default-100",
                                        }}
                                        isDisabled={isSending}
                                    />
                                    <Button
                                        isIconOnly
                                        color="primary"
                                        onPress={handleSendMessage}
                                        isLoading={isSending}
                                        isDisabled={!newMessage.trim()}
                                        aria-label="Gửi tin nhắn"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Input,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";
import { Send, ExternalLink, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";
import { broadcastChatUpdate } from "@/hooks/useUnreadMessages";

interface Message {
  id: string;
  senderId: string;
  senderType: "USER" | "VENDOR";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  customer: {
    id: string;
    name: string;
    image: string | null;
  };
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

const POLL_INTERVAL = 3000;

export default function VendorChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get<{ conversations: Conversation[] }>(
        "/api/chat/conversations?role=vendor",
      );

      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      const data = await api.get<{ messages: Message[] }>(
        `/api/chat/conversations/${selectedConversation}/messages`,
      );

      setMessages(data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [selectedConversation]);

  // Initial load
  useEffect(() => {
    setIsLoadingConversations(true);
    fetchConversations().finally(() => {
      setIsLoadingConversations(false);
    });
  }, [fetchConversations]);

  // Load messages when conversation is selected
  // Refactored to manual call in handleSelectConversation

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Polling for new messages and conversations
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages();
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchConversations, fetchMessages, selectedConversation]);

  const handleSelectConversation = (convId: string) => {
    setSelectedConversation(convId);
    // Clear unread count locally
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId ? { ...conv, unreadCount: 0 } : conv,
      ),
    );

    // Fetch messages immediately
    setIsLoadingMessages(true);
    // We need to pass convId because selectedConversation state might not be updated yet in closure
    // But fetchMessages uses selectedConversation from state.
    // So we should modify fetchMessages to accept an optional ID or use a different approach.
    // Or just define inline here.

    api.get<{ messages: Message[] }>(
      `/api/chat/conversations/${convId}/messages`,
    )
      .then((data) => {
        setMessages(data.messages);
        broadcastChatUpdate();
      })
      .catch((error) => {
        console.error("Failed to fetch messages:", error);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const content = newMessage.trim();

    setNewMessage("");
    setIsSending(true);

    try {
      const data = await api.post<{ message: Message }>(
        `/api/chat/conversations/${selectedConversation}/messages`,
        { content },
      );

      setMessages((prev) => [...prev, data.message]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
              ...conv,
              lastMessage: data.message,
              updatedAt: data.message.createdAt,
            }
            : conv,
        ),
      );

      broadcastChatUpdate();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
      setNewMessage(content);
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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation,
  );

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.createdAt).toDateString();

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);

      return groups;
    },
    {} as Record<string, Message[]>,
  );

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );

  return (
    <div className="p-6 h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tin nhắn</h1>
          <p className="text-default-500">
            Quản lý cuộc trò chuyện với khách hàng
          </p>
        </div>
        {totalUnread > 0 && (
          <Chip color="danger" variant="solid">
            {totalUnread} tin nhắn chưa đọc
          </Chip>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-5rem)]">
        {/* Conversations List */}
        <div className="col-span-4">
          <Card className="h-full">
            <CardBody className="p-0 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner size="lg" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-default-400 p-4">
                  <MessageCircle className="mb-4 opacity-50" size={48} />
                  <p className="text-center">Chưa có cuộc trò chuyện nào</p>
                  <p className="text-sm text-center mt-2">
                    Khách hàng có thể nhắn tin cho bạn từ trang cửa hàng
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      className={`w-full p-4 text-left hover:bg-default-100 transition-colors ${selectedConversation === conv.id
                        ? "bg-primary-50 border-l-4 border-primary"
                        : ""
                        }`}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          name={conv.customer.name}
                          size="sm"
                          src={conv.customer.image || undefined}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">
                              {conv.customer.name}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Chip color="danger" size="sm" variant="solid">
                                {conv.unreadCount}
                              </Chip>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <>
                              <p className="text-sm text-default-500 truncate">
                                {conv.lastMessage.senderType === "VENDOR"
                                  ? "Bạn: "
                                  : ""}
                                {conv.lastMessage.content}
                              </p>
                              <p className="text-xs text-default-400 mt-1">
                                {getRelativeTime(conv.lastMessage.createdAt)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            {!selectedConversation ? (
              <CardBody className="flex items-center justify-center">
                <div className="text-center text-default-400">
                  <MessageCircle
                    className="mx-auto mb-4 opacity-50"
                    size={64}
                  />
                  <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </CardBody>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={selectedConversationData?.customer.name}
                      size="sm"
                      src={
                        selectedConversationData?.customer.image || undefined
                      }
                    />
                    <div>
                      <p className="font-semibold">
                        {selectedConversationData?.customer.name}
                      </p>
                      <p className="text-xs text-default-400">Khách hàng</p>
                    </div>
                  </div>
                  <Button
                    className="hidden" // Hide for now - will show shop link if needed
                    size="sm"
                    startContent={<ExternalLink size={16} />}
                    variant="light"
                    onPress={() => {
                      // Navigate to shop page (user view)
                      window.open(
                        `/shop/${selectedConversationData?.customer.id}`,
                        "_blank",
                      );
                    }}
                  >
                    Xem cửa hàng
                  </Button>
                </div>

                {/* Messages */}
                <CardBody className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner size="lg" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-default-400 py-8">
                      <p>Chưa có tin nhắn nào</p>
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
                              className={`flex ${message.senderType === "VENDOR"
                                ? "justify-end"
                                : "justify-start"
                                }`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.senderType === "VENDOR"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-default-100"
                                  }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${message.senderType === "VENDOR"
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
                </CardBody>

                {/* Input Area */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      classNames={{
                        inputWrapper: "bg-default-100",
                      }}
                      isDisabled={isSending}
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button
                      isIconOnly
                      aria-label="Gửi tin nhắn"
                      color="primary"
                      isDisabled={!newMessage.trim()}
                      isLoading={isSending}
                      onPress={handleSendMessage}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api/api";

const POLL_INTERVAL = 30000; // 30 seconds

interface UseUnreadMessagesOptions {
    role: "user" | "vendor";
    enabled?: boolean;
}

/**
 * Broadcasts a chat update event to all tabs
 */
export function broadcastChatUpdate() {
    try {
        const channel = new BroadcastChannel("fluxify_chat_channel");
        channel.postMessage({ type: "chat_update", timestamp: Date.now() });
        channel.close();
    } catch {
        // ignore
    }
}

/**
 * Hook to fetch and poll unread message count
 * @param options.role - "user" or "vendor" to check unread for
 * @param options.enabled - Whether to enable polling (default: true)
 * @returns Object with unreadCount and refetch function
 */
export function useUnreadMessages({ role, enabled = true }: UseUnreadMessagesOptions) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUnreadCount = useCallback(async () => {
        if (!enabled) return;

        try {
            const data = await api.get<{ unreadCount: number }>(
                `/api/chat/unread?role=${role}`
            );
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        } finally {
            setIsLoading(false);
        }
    }, [role, enabled]);

    useEffect(() => {
        fetchUnreadCount();

        // Poll for updates
        let interval: NodeJS.Timeout;
        if (enabled) {
            interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
        }

        // Listen for updates from other tabs
        const channel = new BroadcastChannel("fluxify_chat_channel");
        channel.onmessage = (event) => {
            if (event.data?.type === "chat_update") {
                fetchUnreadCount();
            }
        };

        return () => {
            if (interval) clearInterval(interval);
            channel.close();
        };
    }, [fetchUnreadCount, enabled]);

    return {
        unreadCount,
        isLoading,
        refetch: fetchUnreadCount,
    };
}

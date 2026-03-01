"use client";

import { useEffect } from "react";

import { api } from "@/lib/api/api";
import { usePollingFetch } from "@/hooks/usePollingFetch";

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
 */
export function useUnreadMessages({ role, enabled = true }: UseUnreadMessagesOptions) {
    const { data, isLoading, refetch } = usePollingFetch<{ unreadCount: number }>({
        fetcher: () =>
            api.get<{ unreadCount: number }>(
                `/api/chat/unread?role=${role}`
            ),
        enabled,
    });

    // Listen for updates from other tabs
    useEffect(() => {
        try {
            const channel = new BroadcastChannel("fluxify_chat_channel");
            channel.onmessage = (event) => {
                if (event.data?.type === "chat_update") {
                    refetch();
                }
            };

            return () => channel.close();
        } catch {
            // BroadcastChannel not supported in this browser
        }
    }, [refetch]);

    return {
        unreadCount: data?.unreadCount ?? 0,
        isLoading,
        refetch,
    };
}

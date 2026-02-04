"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

const LOGOUT_CHANNEL_NAME = "fluxify_logout_channel";

/**
 * Broadcasts a logout event to all other tabs
 * Call this before or after signOut to notify other tabs
 */
export function broadcastLogout() {
    try {
        const channel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
        channel.postMessage({ type: "logout", timestamp: Date.now() });
        channel.close();
    } catch {
        // BroadcastChannel not supported, try localStorage fallback
        try {
            localStorage.setItem("logout_event", Date.now().toString());
            localStorage.removeItem("logout_event");
        } catch {
            // localStorage also not available, ignore
        }
    }
}

/**
 * Signs out and broadcasts logout to other tabs
 * Use this instead of signOut directly to ensure cross-tab logout
 */
export async function signOutWithBroadcast(callbackUrl = "/") {
    // Set flag to prevent this tab from reloading when it receives its own broadcast
    if (typeof window !== "undefined") {
        sessionStorage.setItem("is_logging_out", "true");
    }

    broadcastLogout();
    await signOut({ callbackUrl });
}

/**
 * Hook that listens for logout events from other tabs
 * When a logout is detected, it refreshes the current page
 */
export function useLogoutListener() {
    useEffect(() => {
        let channel: BroadcastChannel | null = null;

        const handleLogout = () => {
            // Check if this tab is the one performing logout
            if (sessionStorage.getItem("is_logging_out") === "true") {
                // Clear the flag and ignore (signOut will handle redirect)
                sessionStorage.removeItem("is_logging_out");
                return;
            }

            // Refresh the page to update auth state
            window.location.reload();
        };

        try {
            // Primary method: BroadcastChannel
            channel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
            channel.onmessage = (event) => {
                if (event.data?.type === "logout") {
                    handleLogout();
                }
            };
        } catch {
            // Fallback: localStorage event (for older browsers)
            const handleStorageChange = (event: StorageEvent) => {
                if (event.key === "logout_event" && event.newValue) {
                    handleLogout();
                }
            };
            window.addEventListener("storage", handleStorageChange);

            return () => {
                window.removeEventListener("storage", handleStorageChange);
            };
        }

        return () => {
            channel?.close();
        };
    }, []);
}

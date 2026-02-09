"use client";

import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api/api";
import { OrderStatus } from "@prisma/client";

const POLL_INTERVAL = 30000; // 30 seconds

interface UseNewOrdersOptions {
    enabled?: boolean;
}

interface OrdersResponse {
    orders: any[];
    pagination: {
        totalOrders: number;
    };
}

/**
 * Hook to fetch and poll new (PENDING) orders count
 * @param options.enabled - Whether to enable polling (default: true)
 * @returns Object with newOrdersCount, isLoading and refetch function
 */
export function useNewOrders({ enabled = true }: UseNewOrdersOptions = {}) {
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNewOrdersCount = useCallback(async () => {
        if (!enabled) return;

        try {
            // We only need the count, so limit=1 is enough
            const data = await api.get<OrdersResponse>(
                `/api/vendor/orders?status=${OrderStatus.PENDING}&limit=1`
            );
            setNewOrdersCount(data.pagination.totalOrders);
        } catch (error) {
            console.error("Failed to fetch new orders count:", error);
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        fetchNewOrdersCount();

        // Poll for updates
        let interval: NodeJS.Timeout;
        if (enabled) {
            interval = setInterval(fetchNewOrdersCount, POLL_INTERVAL);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [fetchNewOrdersCount, enabled]);

    return {
        newOrdersCount,
        isLoading,
        refetch: fetchNewOrdersCount,
    };
}

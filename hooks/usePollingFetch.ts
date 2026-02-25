"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_POLL_INTERVAL = 30000; // 30 seconds

interface UsePollingFetchOptions<T> {
    /** Async function that fetches and returns data */
    fetcher: () => Promise<T>;
    /** Whether to enable polling (default: true) */
    enabled?: boolean;
    /** Polling interval in ms (default: 30000) */
    interval?: number;
}

/**
 * Generic polling hook that fetches data on mount and at regular intervals.
 * Handles loading state, cleanup, and provides a manual refetch function.
 */
export function usePollingFetch<T>({
    fetcher,
    enabled = true,
    interval = DEFAULT_POLL_INTERVAL,
}: UsePollingFetchOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        try {
            const result = await fetcherRef.current();
            setData(result);
        } catch (error) {
            console.error("Polling fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        fetchData();

        let timer: NodeJS.Timeout;
        if (enabled) {
            timer = setInterval(fetchData, interval);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [fetchData, enabled, interval]);

    return { data, isLoading, refetch: fetchData };
}

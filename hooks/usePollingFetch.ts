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
    const [error, setError] = useState<Error | null>(null);
    const fetcherRef = useRef(fetcher);
    const isFetchingRef = useRef(false);
    fetcherRef.current = fetcher;

    const fetchData = useCallback(async () => {
        if (!enabled || isFetchingRef.current) return;

        isFetchingRef.current = true;
        try {
            const result = await fetcherRef.current();
            setData(result);
            setError(null);
        } catch (err) {
            console.error("Polling fetch error:", err);
            setError(err instanceof Error ? err : new Error("Fetch failed"));
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [enabled]);

    useEffect(() => {
        let cancelled = false;

        const safeFetch = async () => {
            if (cancelled) return;
            await fetchData();
        };

        safeFetch();

        let timer: NodeJS.Timeout;
        if (enabled) {
            timer = setInterval(safeFetch, interval);
        }

        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
    }, [fetchData, enabled, interval]);

    return { data, isLoading, error, refetch: fetchData };
}

type RequestOptions = RequestInit & {
    params?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
    timeout?: number;
};

interface RequestConfig {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
}

const defaultConfig: RequestConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
};

class ApiClient {
    private config: RequestConfig;

    constructor(config: Partial<RequestConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    private async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
        const {
            params,
            headers,
            retries = this.config.maxRetries,
            retryDelay = this.config.retryDelay,
            timeout = this.config.timeout,
            signal,
            ...rest
        } = options;

        // Build URL with query params - handle SSR where window is undefined
        const baseUrl = typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const urlObj = new URL(url, baseUrl);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlObj.searchParams.append(key, value);
                }
            });
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Combine with existing signal if provided
        const combinedSignal = signal
            ? this.combineSignals(signal, controller.signal)
            : controller.signal;

        let lastError: Error = new Error("Request failed");

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(urlObj.toString(), {
                    headers: {
                        "Content-Type": "application/json",
                        ...headers,
                    },
                    signal: combinedSignal,
                    ...rest,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    // Don't retry on client errors (4xx) except for 429 (rate limit)
                    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                        let errorMessage = "An error occurred";
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.error || errorData.message || response.statusText;
                        } catch {
                            errorMessage = response.statusText;
                        }
                        throw new Error(errorMessage);
                    }

                    // Retry on 429 (rate limit) or 5xx errors
                    if (attempt < retries) {
                        await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                        continue;
                    }

                    let errorMessage = "An error occurred";
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || response.statusText;
                    } catch {
                        errorMessage = response.statusText;
                    }
                    throw new Error(errorMessage);
                }

                // Handle empty responses (e.g. 204 No Content)
                if (response.status === 204) {
                    return {} as T;
                }

                try {
                    return await response.json();
                } catch {
                    // Fallback if response is not JSON
                    return {} as T;
                }
            } catch (error) {
                clearTimeout(timeoutId);

                if (error instanceof Error && error.name === "AbortError") {
                    throw new Error("Request timeout");
                }

                lastError = error instanceof Error ? error : new Error(String(error));

                // Retry on network errors
                if (attempt < retries && this.isNetworkError(error)) {
                    await this.delay(retryDelay * Math.pow(2, attempt));
                    continue;
                }

                throw lastError;
            }
        }

        throw lastError;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private isNetworkError(error: unknown): boolean {
        if (error instanceof TypeError) {
            return error.message.includes("fetch") || error.message.includes("network");
        }
        return false;
    }

    private combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
        const controller = new AbortController();

        const abort = () => controller.abort();
        signal1.addEventListener("abort", abort);
        signal2.addEventListener("abort", abort);

        return controller.signal;
    }

    get<T>(url: string, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "GET" });
    }

    post<T>(url: string, body: unknown, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) });
    }

    put<T>(url: string, body: unknown, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) });
    }

    patch<T>(url: string, body: unknown, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) });
    }

    delete<T>(url: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "DELETE", body: body ? JSON.stringify(body) : undefined });
    }
}

export const api = new ApiClient();

// Export for custom configuration
export { ApiClient };
export type { RequestOptions };

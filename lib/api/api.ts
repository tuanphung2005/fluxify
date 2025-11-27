type RequestOptions = RequestInit & {
    params?: Record<string, string>;
};

class ApiClient {
    private async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...rest } = options;

        // Build URL with query params
        const urlObj = new URL(url, window.location.origin);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlObj.searchParams.append(key, value);
                }
            });
        }

        const response = await fetch(urlObj.toString(), {
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            ...rest,
        });

        if (!response.ok) {
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
    }

    get<T>(url: string, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "GET" });
    }

    post<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) });
    }

    put<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) });
    }

    patch<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) });
    }

    delete<T>(url: string, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: "DELETE" });
    }
}

export const api = new ApiClient();

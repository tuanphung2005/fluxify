import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "@/lib/api/api";

describe("ApiClient", () => {
    let apiClient: ApiClient;

    beforeEach(() => {
        apiClient = new ApiClient({ maxRetries: 2, retryDelay: 100 });
        vi.clearAllMocks();
    });

    describe("GET requests", () => {
        it("should make successful GET request", async () => {
            const mockData = { id: 1, name: "Test" };
            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockData),
            } as Response);

            const result = await apiClient.get("/api/test");
            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:3000/api/test",
                expect.objectContaining({ method: "GET" })
            );
        });

        it("should append query params to URL", async () => {
            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({}),
            } as Response);

            await apiClient.get("/api/test", { params: { page: "1", limit: "10" } });

            const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
            expect(calledUrl).toContain("page=1");
            expect(calledUrl).toContain("limit=10");
        });

        it("should handle 404 errors without retry", async () => {
            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
                json: () => Promise.resolve({ error: "Resource not found" }),
            } as Response);

            await expect(apiClient.get("/api/test")).rejects.toThrow("Resource not found");
            expect(global.fetch).toHaveBeenCalledTimes(1); // No retries for 4xx
        });

        it("should retry on 500 errors", async () => {
            vi.mocked(global.fetch)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    statusText: "Internal Server Error",
                    json: () => Promise.resolve({ error: "Server error" }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ success: true }),
                } as Response);

            const result = await apiClient.get("/api/test");
            expect(result).toEqual({ success: true });
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe("POST requests", () => {
        it("should make successful POST request with body", async () => {
            const requestBody = { name: "New Item" };
            const responseData = { id: 1, ...requestBody };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: () => Promise.resolve(responseData),
            } as Response);

            const result = await apiClient.post("/api/items", requestBody);

            expect(result).toEqual(responseData);
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:3000/api/items",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify(requestBody),
                })
            );
        });
    });

    describe("DELETE requests", () => {
        it("should handle 204 No Content response", async () => {
            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                status: 204,
            } as Response);

            const result = await apiClient.delete("/api/items/1");
            expect(result).toEqual({});
        });
    });
});

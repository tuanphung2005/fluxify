import "@testing-library/jest-dom/vitest";
import { vi, beforeAll, afterAll } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
}));

// Mock next-auth
vi.mock("@/lib/auth", () => ({
    auth: vi.fn(() => Promise.resolve(null)),
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, "location", {
    value: {
        origin: "http://localhost:3000",
        href: "http://localhost:3000",
        reload: vi.fn(),
    },
    writable: true,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Suppress console errors in tests unless debugging
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === "string" &&
            args[0].includes("Warning: ReactDOM.render is no longer supported")
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});

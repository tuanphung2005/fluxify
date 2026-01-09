import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useCartStore } from "@/store/cart-store";

// Mock HeroUI components
vi.mock("@heroui/button", () => ({
    Button: ({ children, onPress, ...props }: any) => (
        <button onClick={onPress} {...props}>{children}</button>
    ),
}));

vi.mock("@heroui/badge", () => ({
    Badge: ({ children, content, isInvisible }: any) => (
        <div data-testid="badge" data-content={content} data-invisible={isInvisible}>
            {children}
        </div>
    ),
}));

// Import component after mocks
import CartButton from "@/components/shop/CartButton";

describe("CartButton", () => {
    beforeEach(() => {
        // Reset cart store
        useCartStore.setState({
            carts: {},
            currentVendorId: null,
            currentVendorName: null,
            isOpen: false,
        });
    });

    it("should render with zero items badge hidden", () => {
        useCartStore.setState({ currentVendorId: "vendor-1" });
        render(<CartButton />);

        const badge = screen.getByTestId("badge");
        expect(badge.dataset.invisible).toBe("true");
    });

    it("should show correct item count in badge", () => {
        useCartStore.setState({
            currentVendorId: "vendor-1",
            carts: {
                "vendor-1": [
                    { id: "1", name: "Product 1", price: 10, quantity: 2 },
                    { id: "2", name: "Product 2", price: 20, quantity: 3 },
                ],
            },
        });

        render(<CartButton />);

        const badge = screen.getByTestId("badge");
        expect(badge.dataset.content).toBe("5"); // 2 + 3
        expect(badge.dataset.invisible).toBe("false");
    });

    it("should open cart drawer when clicked", () => {
        useCartStore.setState({ currentVendorId: "vendor-1" });
        render(<CartButton />);

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(useCartStore.getState().isOpen).toBe(true);
    });
});

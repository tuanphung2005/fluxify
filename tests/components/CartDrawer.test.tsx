import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useCartStore } from "@/store/cart-store";

// Mock framer-motion
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock HeroUI components
vi.mock("@heroui/button", () => ({
    Button: ({ children, onPress, isIconOnly, ...props }: any) => (
        <button onClick={onPress} {...props}>{children}</button>
    ),
}));

vi.mock("@heroui/scroll-shadow", () => ({
    ScrollShadow: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@heroui/image", () => ({
    Image: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// Mock CheckoutModal
vi.mock("@/components/shop/CheckoutModal", () => ({
    default: () => <div data-testid="checkout-modal" />,
}));

// Import component after mocks
import CartDrawer from "@/components/shop/CartDrawer";

describe("CartDrawer", () => {
    beforeEach(() => {
        useCartStore.setState({
            carts: {},
            currentVendorId: "vendor-1",
            currentVendorName: "Test Shop",
            isOpen: false,
        });
    });

    it("should not render when closed", () => {
        render(<CartDrawer />);
        expect(screen.queryByText("Your Cart")).not.toBeInTheDocument();
    });

    it("should render when open", () => {
        useCartStore.setState({ isOpen: true });
        render(<CartDrawer />);

        expect(screen.getByText(/Your Cart/)).toBeInTheDocument();
    });

    it("should show empty cart message when no items", () => {
        useCartStore.setState({ isOpen: true });
        render(<CartDrawer />);

        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });

    it("should display cart items", () => {
        useCartStore.setState({
            isOpen: true,
            carts: {
                "vendor-1": [
                    { id: "1", name: "Test Product", price: 29.99, quantity: 2 },
                ],
            },
        });

        render(<CartDrawer />);

        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("$29.99")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument(); // quantity
    });

    it("should display correct subtotal", () => {
        useCartStore.setState({
            isOpen: true,
            carts: {
                "vendor-1": [
                    { id: "1", name: "Product 1", price: 10, quantity: 2 },
                    { id: "2", name: "Product 2", price: 15, quantity: 1 },
                ],
            },
        });

        render(<CartDrawer />);

        // 10 * 2 + 15 * 1 = 35
        expect(screen.getByText("$35.00")).toBeInTheDocument();
    });

    it("should show checkout button when items exist", () => {
        useCartStore.setState({
            isOpen: true,
            carts: {
                "vendor-1": [
                    { id: "1", name: "Product", price: 10, quantity: 1 },
                ],
            },
        });

        render(<CartDrawer />);

        expect(screen.getByText("Checkout")).toBeInTheDocument();
    });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useCartStore } from "@/store/cart-store";

// Mock HeroUI components
vi.mock("@heroui/react", () => ({
    Modal: ({ children, isOpen }: any) => isOpen ? <div data-testid="modal">{children}</div> : null,
    ModalContent: ({ children }: any) => <div>{typeof children === 'function' ? children(() => { }) : children}</div>,
    ModalHeader: ({ children }: any) => <div>{children}</div>,
    ModalBody: ({ children }: any) => <div>{children}</div>,
    ModalFooter: ({ children }: any) => <div>{children}</div>,
    Button: ({ children, onPress, isLoading, ...props }: any) => (
        <button onClick={onPress} disabled={isLoading} {...props}>{children}</button>
    ),
    Input: ({ label, value, onValueChange, isRequired, placeholder }: any) => (
        <div>
            <label>{label}{isRequired && " *"}</label>
            <input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                data-testid={`input-${label?.toLowerCase().replace(/\s/g, "-")}`}
            />
        </div>
    ),
}));

// Mock toast
vi.mock("@/lib/toast", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

// Mock API
vi.mock("@/lib/api/api", () => ({
    api: {
        post: vi.fn(),
    },
}));

import CheckoutModal from "@/components/shop/CheckoutModal";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api/api";

describe("CheckoutModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCartStore.setState({
            currentVendorId: "vendor-1",
            currentVendorName: "Test Shop",
            carts: {
                "vendor-1": [
                    { id: "1", name: "Product 1", price: 29.99, quantity: 2 },
                ],
            },
            isOpen: false,
        });
    });

    it("should not render when closed", () => {
        render(<CheckoutModal isOpen={false} onOpenChange={vi.fn()} />);
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render when open", () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("Checkout")).toBeInTheDocument();
    });

    it("should display total amount", () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);
        // 29.99 * 2 = 59.98
        expect(screen.getByText("$59.98")).toBeInTheDocument();
    });

    it("should show required fields", () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        expect(screen.getByText(/Email/)).toBeInTheDocument();
        expect(screen.getByText(/Street Address/)).toBeInTheDocument();
        expect(screen.getByText(/City/)).toBeInTheDocument();
    });

    it("should show error for invalid email", async () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Try to submit without valid email
        const payButton = screen.getByRole("button", { name: /Pay/ });
        fireEvent.click(payButton);

        expect(toast.error).toHaveBeenCalledWith("Please enter a valid email address");
    });

    it("should show error for missing required fields", async () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Fill in valid email but no address
        const emailInput = screen.getByTestId("input-email");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const payButton = screen.getByRole("button", { name: /Pay/ });
        fireEvent.click(payButton);

        expect(toast.error).toHaveBeenCalledWith("Please fill in all required fields");
    });

    it("should submit order successfully", async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ id: "order-1" });

        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Fill in all fields
        fireEvent.change(screen.getByTestId("input-email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("input-street-address"), {
            target: { value: "123 Main St" },
        });
        fireEvent.change(screen.getByTestId("input-city"), {
            target: { value: "New York" },
        });
        fireEvent.change(screen.getByTestId("input-state"), {
            target: { value: "NY" },
        });
        fireEvent.change(screen.getByTestId("input-zip-code"), {
            target: { value: "10001" },
        });
        fireEvent.change(screen.getByTestId("input-country"), {
            target: { value: "USA" },
        });

        const payButton = screen.getByRole("button", { name: /Pay/ });
        fireEvent.click(payButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith("/api/orders", expect.objectContaining({
                email: "test@example.com",
                items: expect.any(Array),
                address: expect.objectContaining({
                    street: "123 Main St",
                    city: "New York",
                }),
            }));
        });
    });

    it("should show error on API failure", async () => {
        vi.mocked(api.post).mockRejectedValueOnce(new Error("Stock error"));

        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Fill in all required fields
        fireEvent.change(screen.getByTestId("input-email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("input-street-address"), {
            target: { value: "123 Main St" },
        });
        fireEvent.change(screen.getByTestId("input-city"), {
            target: { value: "NYC" },
        });
        fireEvent.change(screen.getByTestId("input-state"), {
            target: { value: "NY" },
        });
        fireEvent.change(screen.getByTestId("input-zip-code"), {
            target: { value: "10001" },
        });
        fireEvent.change(screen.getByTestId("input-country"), {
            target: { value: "USA" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Pay/ }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Stock error");
        });
    });
});

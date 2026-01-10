import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useCartStore } from "@/store/cart-store";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

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
                data-testid={`input-${label?.toLowerCase().replace(/\s|\//g, "-")}`}
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
        get: vi.fn(),
        post: vi.fn(),
    },
}));

// Mock VietQR library
vi.mock("@/lib/vietqr", () => ({
    generateVietQRUrl: vi.fn().mockReturnValue("https://img.vietqr.io/image/test.png"),
    hasPaymentConfigured: vi.fn().mockReturnValue(true),
    getBankByCode: vi.fn().mockResolvedValue({
        id: 1,
        code: "VCB",
        shortName: "Vietcombank",
        name: "Ngân hàng Ngoại thương",
        logo: ""
    }),
}));

import CheckoutModal from "@/components/shop/CheckoutModal";

describe("CheckoutModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock cart store
        useCartStore.setState({
            currentVendorId: "vendor-1",
            currentVendorName: "Test Shop",
            carts: {
                "vendor-1": [
                    { id: "1", name: "Product 1", price: 29990, quantity: 2, image: "" },
                ],
            },
            isOpen: false,
        });

        // Mock API responses
        vi.mocked(api.get).mockResolvedValue({
            bankId: "VCB",
            bankAccount: "123456789",
            bankAccountName: "TEST ACCOUNT"
        });
    });

    it("should not render when closed", () => {
        render(<CheckoutModal isOpen={false} onOpenChange={vi.fn()} />);
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render when open", () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("Thanh toán")).toBeInTheDocument();
    });

    it("should display total amount", () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);
        // 29990 * 2 = 59980. Format: 59.980₫
        expect(screen.getByText(/59.980₫/)).toBeInTheDocument();
    });

    it("should show required fields", () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        expect(screen.getByText(/Email/)).toBeInTheDocument();
        expect(screen.getByText(/Địa chỉ/)).toBeInTheDocument();
        expect(screen.getByText(/Thành phố/)).toBeInTheDocument();
    });

    it("should show error for invalid email", async () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Try to submit without valid email
        const payButton = screen.getByRole("button", { name: /Tiếp tục thanh toán/ });
        fireEvent.click(payButton);

        expect(toast.error).toHaveBeenCalledWith("Vui lòng nhập email hợp lệ");
    });

    it("should show error for missing required fields", async () => {
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Fill in valid email but no address
        const emailInput = screen.getByTestId("input-email");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const payButton = screen.getByRole("button", { name: /Tiếp tục thanh toán/ });
        fireEvent.click(payButton);

        expect(toast.error).toHaveBeenCalledWith("Vui lòng nhập họ tên đầy đủ");
    });

    it("should submit order successfully", async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ id: "order-1" });

        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Fill in all fields
        fireEvent.change(screen.getByTestId("input-họ-và-tên"), {
            target: { value: "Nguyễn Văn A" },
        });
        fireEvent.change(screen.getByTestId("input-số-điện-thoại"), {
            target: { value: "0987654321" },
        });
        fireEvent.change(screen.getByTestId("input-email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("input-địa-chỉ"), {
            target: { value: "123 Main St" },
        });
        fireEvent.change(screen.getByTestId("input-thành-phố"), {
            target: { value: "New York" },
        });
        fireEvent.change(screen.getByTestId("input-quận-huyện"), {
            target: { value: "NY" },
        });

        const payButton = screen.getByRole("button", { name: /Tiếp tục thanh toán/ });
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

        // Fill in all required fields including fullName and phoneNumber
        fireEvent.change(screen.getByTestId("input-họ-và-tên"), {
            target: { value: "Nguyễn Văn A" },
        });
        fireEvent.change(screen.getByTestId("input-số-điện-thoại"), {
            target: { value: "0987654321" },
        });
        fireEvent.change(screen.getByTestId("input-email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("input-địa-chỉ"), {
            target: { value: "123 Main St" },
        });
        fireEvent.change(screen.getByTestId("input-thành-phố"), {
            target: { value: "NYC" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Tiếp tục thanh toán/ }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    it("should open zoom modal when clicking QR code", async () => {
        vi.mocked(api.post).mockResolvedValue({ id: "order-123" });
        render(<CheckoutModal isOpen={true} onOpenChange={vi.fn()} />);

        // Fill required fields to proceed to payment
        fireEvent.change(screen.getByTestId("input-họ-và-tên"), {
            target: { value: "Nguyễn Văn A" },
        });
        fireEvent.change(screen.getByTestId("input-số-điện-thoại"), {
            target: { value: "0987654321" },
        });
        fireEvent.change(screen.getByTestId("input-email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("input-địa-chỉ"), {
            target: { value: "123 Main St" },
        });
        fireEvent.change(screen.getByTestId("input-thành-phố"), {
            target: { value: "New York" },
        });

        // Click to proceed to payment
        const payButton = screen.getByRole("button", { name: /Tiếp tục thanh toán/ });
        fireEvent.click(payButton);

        // Wait for QR code to appear (now in payment step)
        const qrImage = await screen.findByAltText("VietQR Payment Code");
        expect(qrImage).toBeInTheDocument();

        // Click to zoom
        fireEvent.click(qrImage);

        // Check for zoomed image
        const zoomedImage = await screen.findByAltText("VietQR Full Size");
        expect(zoomedImage).toBeInTheDocument();
    });
});

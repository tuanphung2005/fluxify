import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
}));

// Mock HeroUI components
vi.mock("@heroui/card", () => ({
    Card: ({ children, onPress, isPressable, ...props }: any) => (
        <div onClick={isPressable ? onPress : undefined} {...props}>{children}</div>
    ),
    CardBody: ({ children, onClick, ...props }: any) => (
        <div onClick={onClick} {...props}>{children}</div>
    ),
    CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@heroui/image", () => ({
    Image: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

vi.mock("@heroui/button", () => ({
    Button: ({ children, onPress, ...props }: any) => (
        <button onClick={onPress} {...props}>{children}</button>
    ),
}));

vi.mock("@heroui/chip", () => ({
    Chip: ({ children }: any) => <span>{children}</span>,
}));

// Import component after mocks
import ProductCard from "@/components/common/ProductCard";

describe("ProductCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const defaultProps = {
        id: "product-1",
        name: "Test Product",
        price: 29.99,
        images: ["/test-image.jpg"],
        vendorId: "vendor-1",
    };

    it("should render product name and price", () => {
        render(<ProductCard {...defaultProps} />);

        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("29,99₫")).toBeInTheDocument();
    });

    it("should display product image", () => {
        render(<ProductCard {...defaultProps} />);

        const image = screen.getByAltText("Test Product");
        expect(image).toHaveAttribute("src", "/test-image.jpg");
    });

    it("should use placeholder when no image provided", () => {
        render(<ProductCard {...defaultProps} images={[]} />);

        const image = screen.getByAltText("Test Product");
        expect(image).toHaveAttribute("src", "/placeholder.png");
    });

    it("should show sale badge when isSale is true", () => {
        render(<ProductCard {...defaultProps} isSale={true} />);

        expect(screen.getByText("Giảm giá")).toBeInTheDocument();
    });

    it("should show low stock badge", () => {
        render(<ProductCard {...defaultProps} stockStatus="low_stock" />);

        expect(screen.getByText("Sắp hết")).toBeInTheDocument();
    });

    it("should show out of stock overlay", () => {
        render(<ProductCard {...defaultProps} stockStatus="out_of_stock" />);

        expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    });

    it("should show add to cart button when enabled and in stock", () => {
        render(<ProductCard {...defaultProps} showAddToCart={true} />);

        expect(screen.getByText("Thêm vào giỏ")).toBeInTheDocument();
    });

    it("should not show add to cart button when out of stock", () => {
        render(
            <ProductCard
                {...defaultProps}
                showAddToCart={true}
                stockStatus="out_of_stock"
            />
        );

        expect(screen.queryByText("Thêm vào giỏ")).not.toBeInTheDocument();
    });

    it("should call onAddToCart when add to cart is clicked", () => {
        const onAddToCart = vi.fn();
        render(
            <ProductCard
                {...defaultProps}
                showAddToCart={true}
                onAddToCart={onAddToCart}
            />
        );

        fireEvent.click(screen.getByText("Thêm vào giỏ"));
        expect(onAddToCart).toHaveBeenCalledWith("product-1");
    });

    it("should navigate to product page when clicked without add to cart", () => {
        render(<ProductCard {...defaultProps} showAddToCart={false} />);

        fireEvent.click(screen.getByText("Test Product"));
        expect(mockPush).toHaveBeenCalledWith(
            "/shop/vendor-1?productId=product-1",
            { scroll: false }
        );
    });

    it("should call custom onPress handler when provided", () => {
        const onPress = vi.fn();
        render(<ProductCard {...defaultProps} onPress={onPress} />);

        fireEvent.click(screen.getByText("Test Product"));
        expect(onPress).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });
});

"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    images: string[];
    vendorId?: string;
    description?: string;
    isSale?: boolean;
    stockStatus?: StockStatus;
    showAddToCart?: boolean;
    onAddToCart?: (id: string) => void;
    onPress?: () => void;
    variants?: Record<string, unknown>;
}

/**
 * Unified ProductCard component with modern styling
 * Supports navigation to product page and optional Add to Cart button
 */
export default function ProductCard({
    id,
    name,
    price,
    images = [],
    vendorId,
    isSale = false,
    stockStatus = "in_stock",
    showAddToCart = false,
    onAddToCart,
    onPress,
}: ProductCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        if (onPress) {
            onPress();
        } else if (vendorId) {
            // Use query param to open modal instead of navigating to new page
            router.push(`/shop/${vendorId}?productId=${id}`, { scroll: false });
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart?.(id);
    };

    const isOutOfStock = stockStatus === "out_of_stock";
    const hasButton = showAddToCart && !isOutOfStock;

    return (
        <Card
            className="overflow-hidden group"
            isPressable={!hasButton}
            onPress={!hasButton ? handleCardClick : undefined}
        >
            {/* Image Section */}
            <div
                className={`relative aspect-square overflow-hidden ${hasButton ? "cursor-pointer" : ""}`}
                onClick={hasButton ? handleCardClick : undefined}
            >
                <Image
                    src={images[0] || "/placeholder.png"}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    removeWrapper
                />
                {/* Sale Badge */}
                {isSale && (
                    <Chip
                        color="danger"
                        variant="flat"
                        className="absolute top-2 left-2 z-10"
                        size="sm"
                    >
                        Sale
                    </Chip>
                )}
                {/* Low Stock Badge */}
                {stockStatus === "low_stock" && (
                    <Chip
                        color="warning"
                        variant="flat"
                        className="absolute top-2 right-2 z-10"
                        size="sm"
                    >
                        Low Stock
                    </Chip>
                )}
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
                        <Chip color="default" variant="solid">
                            Out of Stock
                        </Chip>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <CardBody
                className={`p-4 ${hasButton ? "cursor-pointer" : ""}`}
                onClick={hasButton ? handleCardClick : undefined}
            >
                <h3 className="font-semibold line-clamp-1">{name}</h3>
                <p className="text-lg font-bold text-primary">
                    ${Number(price).toFixed(2)}
                </p>
            </CardBody>

            {/* Add to Cart Button */}
            {hasButton && (
                <CardFooter className="pt-0">
                    <Button
                        color="primary"
                        variant="flat"
                        fullWidth
                        startContent={<ShoppingCart size={18} />}
                        onPress={handleAddToCart as unknown as () => void}
                    >
                        Add to Cart
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

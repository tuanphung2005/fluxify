"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image as HeroUIImage } from "@heroui/image";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    images: string[];
    isSale?: boolean;
    stockStatus?: StockStatus;
    showAddToCart?: boolean;
    onAddToCart?: (id: string) => void;
    onPress?: () => void;
    variants?: any;
}

export default function ProductCard({
    id,
    name,
    price,
    images = [],
    isSale = false,
    stockStatus = "in_stock",
    showAddToCart = false,
    onAddToCart,
    onPress,
    variants,
}: ProductCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Cycle through images every 3 seconds if multiple images exist
    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    // Parse variants to display
    const variantOptions = variants
        ? Object.entries(variants).map(([name, values]) => ({
            name,
            count: Array.isArray(values) ? values.length : 0,
        }))
        : [];

    return (
        <Badge
            content="New"
            color="secondary"
            isInvisible={true}
            placement="top-right"
            className="z-10"
        >
            <Card shadow="sm" className="w-full">
                <CardBody className="p-0 relative">
                    <div
                        className={onPress ? "cursor-pointer" : ""}
                        onClick={onPress}
                        role={onPress ? "button" : undefined}
                        tabIndex={onPress ? 0 : undefined}
                        onKeyDown={(e) => {
                            if (onPress && (e.key === "Enter" || e.key === " ")) {
                                onPress();
                            }
                        }}
                    >
                        <HeroUIImage
                            src={images[currentImageIndex] || images[0]}
                            alt={name}
                            className="w-full object-cover transition-opacity duration-500"
                            width="100%"
                            height={300}
                        />
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
                        {stockStatus === "low_stock" && (
                            <Chip
                                color="warning"
                                variant="flat"
                                className="absolute bottom-2 right-2 z-10"
                                size="sm"
                            >
                                Low Stock
                            </Chip>
                        )}
                        {stockStatus === "out_of_stock" && (
                            <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center">
                                <Chip color="default" variant="solid">
                                    Out of Stock
                                </Chip>
                            </div>
                        )}
                    </div>
                </CardBody>
                <CardFooter className="flex-col items-start gap-2">
                    <div
                        className={`w-full ${onPress ? "cursor-pointer" : ""}`}
                        onClick={onPress}
                    >
                        <h3 className="font-semibold text-lg">{name}</h3>
                        <p className="text-2xl font-bold text-primary">
                            ${price.toFixed(2)}
                        </p>
                        {variantOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {variantOptions.map((variant, idx) => (
                                    <Chip
                                        key={idx}
                                        size="sm"
                                        variant="flat"
                                        className="text-tiny"
                                    >
                                        {variant.name}: {variant.count}
                                    </Chip>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end w-full">
                        {showAddToCart && stockStatus !== "out_of_stock" && (
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<ShoppingCart className="w-4 h-4" />}
                                onPress={() => onAddToCart?.(id)}
                            >
                                Add to Cart
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Badge>
    );
}

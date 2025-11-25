"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import { ShoppingCart } from "lucide-react";

export interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    images: string[];
    showAddToCart?: boolean;
    onAddToCart?: (id: string) => void;
    isNew?: boolean;
    isSale?: boolean;
    stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
}

export default function ProductCard({
    id,
    name,
    price,
    images,
    showAddToCart = true,
    onAddToCart,
    isNew = false,
    isSale = false,
    stockStatus = "in_stock",
}: ProductCardProps) {
    return (
        <Badge
            content="New"
            color="secondary"
            isInvisible={!isNew}
            placement="top-right"
            className="z-10"
        >
            <Card shadow="sm" className="w-full">
                <CardBody className="p-0 relative">
                    <Image
                        src={images[0]}
                        alt={name}
                        className="w-full object-cover"
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
                </CardBody>
                <CardFooter className="flex-col items-start gap-2">
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <div className="flex justify-between items-center w-full">
                        <p className="text-2xl font-bold text-primary">
                            ${price.toFixed(2)}
                        </p>
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

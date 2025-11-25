"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { ProductGridConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";
import { ShoppingCart } from "lucide-react";
import { Image } from "@heroui/image";

interface ProductGridProps extends BaseComponentProps<ProductGridConfig> {
    products?: Array<{
        id: string;
        name: string;
        price: number;
        images: string[];
    }>;
}

export default function ProductGrid ({
    config,
    products = [],
}: ProductGridProps) {
    const {
        title,
        columns = 3,
        showAddToCart = true,
    } = config as ProductGridConfig;

    // demo products TODO: MAKE A REUSEABLE PRODUCT CARD COMPONENT
    const displayProducts =
        products.length > 0
            ? products
            : [
                {
                    id: "1",
                    name: "Sample Product 1",
                    price: 29.99,
                    images: ["/api/placeholder/400/400"],
                },
                {
                    id: "2",
                    name: "Sample Product 2",
                    price: 49.99,
                    images: ["/api/placeholder/400/400"],
                },
                {
                    id: "3",
                    name: "Sample Product 3",
                    price: 39.99,
                    images: ["/api/placeholder/400/400"],
                },
            ];

    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

    return (
        <div className="py-12 px-6">
            {title && (
                <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
            )}
            <div className={`grid ${gridCols} gap-6 max-w-7xl mx-auto`}>
                {displayProducts.map((product) => (
                    <Card key={product.id} shadow="sm">
                        <CardBody className="p-0">
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full object-cover"
                                width="100%"
                                height={300}
                            />
                        </CardBody>
                        <CardFooter className="flex-col items-start gap-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="flex justify-between items-center w-full">
                                <p className="text-2xl font-bold text-primary">
                                    ${product.price.toFixed(2)}
                                </p>
                                {showAddToCart && (
                                    <Button
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        startContent={<ShoppingCart className="w-4 h-4" />}
                                    >
                                        Add to Cart
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

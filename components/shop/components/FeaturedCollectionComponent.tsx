"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import { ShoppingCart, Package } from "lucide-react";
import { api } from "@/lib/api/api";
import type { FeaturedCollectionConfig } from "@/types/shop";
import type { ProductData } from "@/types/api";

interface FeaturedCollectionComponentProps {
    config: FeaturedCollectionConfig;
}

export default function FeaturedCollectionComponent({ config }: FeaturedCollectionComponentProps) {
    const {
        title,
        description,
        productIds,
        layout = "grid",
        columns = 4,
        showAddToCart = true,
    } = config;

    const [products, setProducts] = useState<ProductData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [productIds]);

    const fetchProducts = async () => {
        if (!productIds || productIds.length === 0) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch all products and filter by IDs
            // API returns { products, total, totalPages, currentPage }
            const response = await api.get<{ products: ProductData[] } | ProductData[]>("/api/products?limit=100");

            // Handle both response formats
            let allProducts: ProductData[] = [];
            if (Array.isArray(response)) {
                allProducts = response;
            } else if (response && 'products' in response) {
                allProducts = response.products || [];
            }

            const selectedProducts = allProducts.filter(p => productIds.includes(p.id));

            // Sort by the order in productIds
            selectedProducts.sort((a, b) =>
                productIds.indexOf(a.id) - productIds.indexOf(b.id)
            );

            setProducts(selectedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <Spinner size="lg" />
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-16 px-4 bg-default-50">
                <div className="max-w-7xl mx-auto text-center text-default-500">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No products in this collection yet.</p>
                </div>
            </section>
        );
    }

    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

    return (
        <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    {description && (
                        <p className="text-lg text-default-600 max-w-2xl mx-auto">
                            {description}
                        </p>
                    )}
                </div>

                {/* Products */}
                {layout === "list" ? (
                    <div className="space-y-4">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className="flex-row overflow-hidden"
                                isPressable
                            >
                                <div className="w-32 h-32 flex-shrink-0">
                                    <Image
                                        src={product.images?.[0] || "/placeholder.png"}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardBody className="flex-1">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-default-500 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <p className="text-lg font-bold text-primary mt-2">
                                        ${Number(product.price).toFixed(2)}
                                    </p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className={`grid ${gridCols} gap-6`}>
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className="overflow-hidden group"
                                isPressable={!showAddToCart}
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <Image
                                        src={product.images?.[0] || "/placeholder.png"}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        removeWrapper
                                    />
                                </div>
                                <CardBody className="p-4">
                                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                    <p className="text-lg font-bold text-primary">
                                        ${Number(product.price).toFixed(2)}
                                    </p>
                                </CardBody>
                                {showAddToCart && (
                                    <CardFooter className="pt-0">
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            fullWidth
                                            startContent={<ShoppingCart size={18} />}
                                        >
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

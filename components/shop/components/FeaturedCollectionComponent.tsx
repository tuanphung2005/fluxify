"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@heroui/spinner";
import { Package } from "lucide-react";
import { api } from "@/lib/api/api";
import ProductCard from "@/components/common/ProductCard";
import type { FeaturedCollectionConfig } from "@/types/shop";
import type { ProductData } from "@/types/api";

interface FeaturedCollectionComponentProps {
    config: FeaturedCollectionConfig;
    vendorId?: string;
}

export default function FeaturedCollectionComponent({
    config,
    vendorId,
}: FeaturedCollectionComponentProps) {
    const {
        title,
        description,
        productIds,
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

                {/* Products Grid */}
                <div className={`grid ${gridCols} gap-6`}>
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={Number(product.price)}
                            images={product.images || []}
                            vendorId={vendorId}
                            showAddToCart={showAddToCart}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

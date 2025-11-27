"use client";

import { ProductGridConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";
import ProductCard from "../../common/ProductCard";

interface ProductGridProps extends BaseComponentProps<ProductGridConfig> {
    products?: Array<{
        id: string;
        name: string;
        price: number;
        images: string[];
    }>;
}

export default function ProductGrid({
    config,
    products = [],
}: ProductGridProps) {
    const {
        title,
        columns = 3,
        showAddToCart = true,
        productIds = [],
        showAllProducts = true,
    } = config as ProductGridConfig;

    // Filter products based on configuration
    const filteredProducts = showAllProducts
        ? products
        : products.filter((p) => productIds.includes(p.id));

    // demo products TODO: MAKE A REUSEABLE PRODUCT CARD COMPONENT
    const displayProducts =
        filteredProducts.length > 0
            ? filteredProducts
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
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        images={product.images}
                        showAddToCart={showAddToCart}
                        onAddToCart={(id: string) => console.log("Add to cart:", id)}
                    />
                ))}
            </div>
        </div>
    );
}

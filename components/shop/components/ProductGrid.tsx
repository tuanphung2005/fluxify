"use client";

import ProductCard from "../../common/ProductCard";

import { ProductGridConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";
import { useCartStore } from "@/store/cart-store";

interface ProductGridProps extends BaseComponentProps<ProductGridConfig> {
  products?: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    variants?: any;
    variantStock?: any;
  }>;
  vendorId?: string;
  vendorName?: string;
}

export default function ProductGrid({
  config,
  products = [],
  vendorId,
  vendorName,
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

  // Demo products for empty state
  const displayProducts =
    filteredProducts.length > 0
      ? filteredProducts
      : [
          {
            id: "1",
            name: "Sản phẩm mẫu 1",
            price: 29.99,
            images: ["/placeholder.png"],
          },
          {
            id: "2",
            name: "Sản phẩm mẫu 2",
            price: 49.99,
            images: ["/placeholder.png"],
          },
          {
            id: "3",
            name: "Sản phẩm mẫu 3",
            price: 39.99,
            images: ["/placeholder.png"],
          },
        ];

  const gridCols =
    {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const { addItem, setIsOpen } = useCartStore();

  const handleAddToCart = (productId: string) => {
    const product = displayProducts.find((p) => p.id === productId);

    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      });
      setIsOpen(true);
    }
  };

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
            images={product.images}
            name={product.name}
            price={product.price}
            showAddToCart={showAddToCart}
            variantStock={product.variantStock}
            variants={product.variants}
            vendorId={vendorId}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import type { FeaturedCollectionConfig } from "@/types/shop";
import type { ProductData } from "@/types/api";

import { useState, useEffect, useMemo } from "react";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { Package, Search } from "lucide-react";

import { api } from "@/lib/api/api";
import ProductCard from "@/components/common/ProductCard";
import { useCartStore } from "@/store/cart-store";

interface FeaturedCollectionComponentProps {
  config: FeaturedCollectionConfig;
  vendorId?: string;
  vendorName?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    description?: string | null;
    stock?: number;
    images: string[];
    variants?: unknown;
  }>;
}

export default function FeaturedCollectionComponent({
  config,
  vendorId,
  vendorName,
  products: productsFromParent,
}: FeaturedCollectionComponentProps) {
  const {
    title,
    description,
    productIds,
    columns = 4,
    showAddToCart = true,
    showAllProducts = false,
    showSearchBar = true,
  } = config;

  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem, setIsOpen } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, [productsFromParent]);

  const loadProducts = async () => {
    // If products are provided from parent (public shop page), use them directly
    if (productsFromParent && productsFromParent.length > 0) {
      const mappedProducts = productsFromParent.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        stock: p.stock,
        images: p.images,
        variants: p.variants,
      })) as ProductData[];

      setAllProducts(mappedProducts);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from API (builder mode where vendor is authenticated)
    try {
      const response = await api.get<
        { products: ProductData[] } | ProductData[]
      >("/api/products?limit=100");

      let fetchedProducts: ProductData[] = [];

      if (Array.isArray(response)) {
        fetchedProducts = response;
      } else if (response && "products" in response) {
        fetchedProducts = response.products || [];
      }

      setAllProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on showAllProducts and productIds
  const filteredBySelection = useMemo(() => {
    if (showAllProducts) {
      return allProducts;
    }

    if (!productIds || productIds.length === 0) {
      return [];
    }

    const selected = allProducts.filter((p) => productIds.includes(p.id));
    // Sort by the order in productIds
    selected.sort(
      (a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id),
    );
    return selected;
  }, [allProducts, showAllProducts, productIds]);

  // Apply search filter locally
  const displayProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return filteredBySelection;
    }

    return filteredBySelection.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query),
    );
  }, [filteredBySelection, searchQuery]);

  const handleAddToCart = (productId: string) => {
    const product = displayProducts.find((p) => p.id === productId);

    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0],
      });
      setIsOpen(true);
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

  const hasProducts = filteredBySelection.length > 0;

  const gridCols =
    {
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

        {/* Search Bar */}
        {showSearchBar && hasProducts && (
          <div className="max-w-md mx-auto mb-8">
            <Input
              classNames={{
                inputWrapper: "bg-default-100",
              }}
              placeholder="Tìm kiếm sản phẩm..."
              startContent={<Search className="text-default-400" size={18} />}
              type="search"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
        )}

        {/* Empty State */}
        {!hasProducts && (
          <div className="text-center text-default-500 py-8 bg-default-50 rounded-lg">
            <Package className="mx-auto mb-4 opacity-50" size={48} />
            <p>Chưa có sản phẩm nào trong bộ sưu tập này.</p>
          </div>
        )}

        {/* No Search Results */}
        {hasProducts && displayProducts.length === 0 && searchQuery && (
          <div className="text-center text-default-500 py-8">
            <p>Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"</p>
          </div>
        )}

        {/* Products Grid */}
        {displayProducts.length > 0 && (
          <div className={`grid ${gridCols} gap-6`}>
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                images={product.images || []}
                name={product.name}
                price={Number(product.price)}
                showAddToCart={showAddToCart}
                variantStock={(product as any).variantStock}
                variants={product.variants}
                vendorId={vendorId}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

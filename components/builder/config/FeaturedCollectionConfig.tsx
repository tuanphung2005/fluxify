"use client";

import type { FeaturedCollectionConfig } from "@/types/shop";

import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useDisclosure } from "@heroui/react";
import { Package, Plus, X } from "lucide-react";

import ProductSelectorModal from "./ProductSelectorModal";

import { api } from "@/lib/api/api";

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  images?: string[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface FeaturedCollectionConfigPanelProps {
  config: FeaturedCollectionConfig;
  onUpdate: (
    field: string | Partial<FeaturedCollectionConfig>,
    value?: unknown,
  ) => void;
}

export default function FeaturedCollectionConfigPanel({
  config,
  onUpdate,
}: FeaturedCollectionConfigPanelProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const productIds = config.productIds || [];
  const showAllProducts = config.showAllProducts ?? false;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ProductsResponse | Product[]>(
        "/api/products?limit=100",
      );

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && "products" in data) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (selectedIds: string[]) => {
    onUpdate("productIds", selectedIds);
  };

  const removeProduct = (id: string) => {
    onUpdate(
      "productIds",
      productIds.filter((p) => p !== id),
    );
  };

  const handleShowAllProductsChange = (value: boolean) => {
    if (value) {
      // Clear product selection when showing all products
      onUpdate({
        showAllProducts: value,
        productIds: [],
      });
    } else {
      onUpdate("showAllProducts", value);
    }
  };

  // Get product names for display
  const getProductName = (id: string) => {
    const product = products.find((p) => p.id === id);

    return product?.name || id;
  };

  return (
    <div className="space-y-4">
      <Input
        label="Tiêu đề bộ sưu tập"
        placeholder="Sản phẩm nổi bật"
        value={config.title || ""}
        onValueChange={(v) => onUpdate("title", v)}
      />

      <Textarea
        label="Mô tả"
        minRows={2}
        placeholder="Các sản phẩm được tuyển chọn dành riêng cho bạn"
        value={config.description || ""}
        onValueChange={(v) => onUpdate("description", v)}
      />

      <Divider />

      <Select
        label="Bố cục"
        selectedKeys={[config.layout || "grid"]}
        onSelectionChange={(keys) => onUpdate("layout", Array.from(keys)[0])}
      >
        <SelectItem key="grid">Lưới</SelectItem>
        <SelectItem key="list">Danh sách</SelectItem>
      </Select>

      <Select
        label="Số cột"
        selectedKeys={[String(config.columns || 4)]}
        onSelectionChange={(keys) =>
          onUpdate("columns", Number(Array.from(keys)[0]))
        }
      >
        <SelectItem key="2">2 cột</SelectItem>
        <SelectItem key="3">3 cột</SelectItem>
        <SelectItem key="4">4 cột</SelectItem>
        <SelectItem key="5">5 cột</SelectItem>
      </Select>

      <Switch
        isSelected={config.showAddToCart !== false}
        onValueChange={(v) => onUpdate("showAddToCart", v)}
      >
        Hiển thị nút Thêm vào giỏ
      </Switch>

      <Switch
        isSelected={config.showSearchBar !== false}
        onValueChange={(v) => onUpdate("showSearchBar", v)}
      >
        Hiển thị thanh tìm kiếm
      </Switch>

      <Divider />

      <Switch
        isSelected={showAllProducts}
        onValueChange={handleShowAllProductsChange}
      >
        Hiển thị tất cả sản phẩm
      </Switch>

      {!showAllProducts && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Sản phẩm ({productIds.length})</h4>
            <Button color="primary" size="sm" variant="flat" onPress={onOpen}>
              <Plus size={16} /> Chọn
            </Button>
          </div>

          {productIds.length === 0 ? (
            <div className="text-center py-6 bg-default-50 rounded-lg text-default-400">
              <Package className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Chưa chọn sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {productIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-2 bg-default-50 rounded"
                >
                  <span className="text-sm truncate">{getProductName(id)}</span>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => removeProduct(id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ProductSelectorModal
        isLoading={isLoading}
        isOpen={isOpen}
        products={products}
        selectedProductIds={productIds}
        onOpenChange={onOpenChange}
        onSelectionChange={handleProductSelect}
      />
    </div>
  );
}

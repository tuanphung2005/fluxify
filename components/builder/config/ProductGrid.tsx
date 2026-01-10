import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { ProductGridConfig as ProductGridConfigType } from "@/types/shop";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import { useDisclosure } from "@heroui/modal";
import { Package } from "lucide-react";
import ProductSelectorModal from "./ProductSelectorModal";

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

export default function ProductGrid({
    config,
    onUpdate,
}: BaseComponentConfigProps<ProductGridConfigType>) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<string[]>(
        config.productIds || []
    );
    const showAllProducts = config.showAllProducts ?? true;
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        // Update config when selected products change
        if (!showAllProducts) {
            onUpdate("productIds", selectedProducts);
        }
    }, [selectedProducts, showAllProducts]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // API returns paginated response with products array
            const data = await api.get<ProductsResponse | Product[]>("/api/products?limit=100");
            // Handle both paginated response and direct array
            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data && 'products' in data) {
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

    const handleShowAllProductsChange = (value: boolean) => {
        if (value) {
            // Clear product selection when showing all products
            onUpdate({
                showAllProducts: value,
                productIds: []
            });
            setSelectedProducts([]);
        } else {
            onUpdate("showAllProducts", value);
        }
    };

    const handleSelectionChange = (selectedIds: string[]) => {
        setSelectedProducts(selectedIds);
    };

    // Get names of selected products for display
    const selectedProductNames = products
        .filter((p) => selectedProducts.includes(p.id))
        .map((p) => p.name);

    return (
        <>
            <Input
                label="Tiêu đề (Tùy chọn)"
                value={config.title || ""}
                onValueChange={(value) => onUpdate("title", value)}
            />
            <Select
                label="Số cột"
                selectedKeys={[String(config.columns || 3)]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("columns", Number(value));
                }}
            >
                <SelectItem key="2">2 Cột</SelectItem>
                <SelectItem key="3">3 Cột</SelectItem>
                <SelectItem key="4">4 Cột</SelectItem>
            </Select>
            <Switch
                isSelected={config.showAddToCart ?? true}
                onValueChange={(value) => onUpdate("showAddToCart", value)}
            >
                Hiển thị nút Thêm vào giỏ
            </Switch>
            <Switch
                isSelected={showAllProducts}
                onValueChange={handleShowAllProductsChange}
            >
                Hiển thị tất cả sản phẩm
            </Switch>

            {!showAllProducts && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Sản phẩm đã chọn</p>
                        <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<Package size={16} />}
                            onPress={onOpen}
                        >
                            Chọn sản phẩm
                        </Button>
                    </div>

                    {selectedProducts.length === 0 ? (
                        <p className="text-xs text-default-500 bg-default-100 rounded-lg p-3 text-center">
                            Chưa chọn sản phẩm nào. Nhấn "Chọn sản phẩm" để chọn sản phẩm muốn hiển thị.
                        </p>
                    ) : (
                        <div className="bg-default-100 rounded-lg p-3">
                            <p className="text-xs text-default-500 mb-2">
                                {selectedProducts.length} sản phẩm đã chọn:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {selectedProductNames.slice(0, 5).map((name, index) => (
                                    <span
                                        key={index}
                                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                    >
                                        {name}
                                    </span>
                                ))}
                                {selectedProductNames.length > 5 && (
                                    <span className="text-xs text-default-500 px-2 py-1">
                                        + thêm {selectedProductNames.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ProductSelectorModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                products={products}
                selectedProductIds={selectedProducts}
                onSelectionChange={handleSelectionChange}
                isLoading={isLoading}
            />
        </>
    );
}


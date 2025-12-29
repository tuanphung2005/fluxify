"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import ProductSelectorModal from "./ProductSelectorModal";
import { useDisclosure } from "@heroui/react";
import { Package, Plus, X } from "lucide-react";
import { api } from "@/lib/api/api";
import type { FeaturedCollectionConfig } from "@/types/shop";

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
    onUpdate: (field: string | Partial<FeaturedCollectionConfig>, value?: unknown) => void;
}

export default function FeaturedCollectionConfigPanel({ config, onUpdate }: FeaturedCollectionConfigPanelProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const productIds = config.productIds || [];
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<ProductsResponse | Product[]>("/api/products?limit=100");
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

    const handleProductSelect = (selectedIds: string[]) => {
        onUpdate("productIds", selectedIds);
    };

    const removeProduct = (id: string) => {
        onUpdate("productIds", productIds.filter(p => p !== id));
    };

    // Get product names for display
    const getProductName = (id: string) => {
        const product = products.find(p => p.id === id);
        return product?.name || id;
    };

    return (
        <div className="space-y-4">
            <Input
                label="Collection Title"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
                placeholder="Featured Products"
            />

            <Textarea
                label="Description"
                value={config.description || ""}
                onValueChange={(v) => onUpdate("description", v)}
                placeholder="Hand-picked products just for you"
                minRows={2}
            />

            <Divider />

            <Select
                label="Layout"
                selectedKeys={[config.layout || "grid"]}
                onSelectionChange={(keys) => onUpdate("layout", Array.from(keys)[0])}
            >
                <SelectItem key="grid">Grid</SelectItem>
                <SelectItem key="list">List</SelectItem>
            </Select>

            <Select
                label="Columns"
                selectedKeys={[String(config.columns || 4)]}
                onSelectionChange={(keys) => onUpdate("columns", Number(Array.from(keys)[0]))}
            >
                <SelectItem key="2">2 columns</SelectItem>
                <SelectItem key="3">3 columns</SelectItem>
                <SelectItem key="4">4 columns</SelectItem>
                <SelectItem key="5">5 columns</SelectItem>
            </Select>

            <Switch
                isSelected={config.showAddToCart !== false}
                onValueChange={(v) => onUpdate("showAddToCart", v)}
            >
                Show Add to Cart
            </Switch>

            <Divider />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Products ({productIds.length})</h4>
                    <Button size="sm" color="primary" variant="flat" onPress={onOpen}>
                        <Plus size={16} /> Select
                    </Button>
                </div>

                {productIds.length === 0 ? (
                    <div className="text-center py-6 bg-default-50 rounded-lg text-default-400">
                        <Package size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No products selected</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {productIds.map((id) => (
                            <div key={id} className="flex items-center justify-between p-2 bg-default-50 rounded">
                                <span className="text-sm truncate">{getProductName(id)}</span>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onPress={() => removeProduct(id)}
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProductSelectorModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                products={products}
                selectedProductIds={productIds}
                onSelectionChange={handleProductSelect}
                isLoading={isLoading}
            />
        </div>
    );
}


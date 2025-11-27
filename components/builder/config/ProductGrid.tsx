import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Checkbox, CheckboxGroup } from "@heroui/react";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { ProductGridConfig as ProductGridConfigType } from "@/types/shop";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";

interface Product {
    id: string;
    name: string;
    price: number | string;
    stock: number;
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
    const [searchQuery, setSearchQuery] = useState("");
    const showAllProducts = config.showAllProducts ?? true;

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
            const data = await api.get<Product[]>("/api/products");
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowAllProductsChange = (value: boolean) => {
        onUpdate("showAllProducts", value);
        if (value) {
            // Clear product selection when showing all products
            onUpdate("productIds", []);
            setSelectedProducts([]);
        }
    };

    // Filter products based on search query
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Input
                label="Section Title (Optional)"
                value={config.title || ""}
                onValueChange={(value) => onUpdate("title", value)}
            />
            <Select
                label="Columns"
                selectedKeys={[String(config.columns || 3)]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("columns", Number(value));
                }}
            >
                <SelectItem key="2">2 Columns</SelectItem>
                <SelectItem key="3">3 Columns</SelectItem>
                <SelectItem key="4">4 Columns</SelectItem>
            </Select>
            <Switch
                isSelected={config.showAddToCart ?? true}
                onValueChange={(value) => onUpdate("showAddToCart", value)}
            >
                Show Add to Cart Button
            </Switch>
            <Switch
                isSelected={showAllProducts}
                onValueChange={handleShowAllProductsChange}
            >
                Show All Products
            </Switch>

            {!showAllProducts && (
                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Select Products</p>
                    {isLoading ? (
                        <p className="text-xs text-default-500">Loading products...</p>
                    ) : products.length === 0 ? (
                        <p className="text-xs text-default-500">
                            No products available. Add products first.
                        </p>
                    ) : (
                        <>
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                size="sm"
                                className="mb-3"
                            />
                            <CheckboxGroup
                                value={selectedProducts}
                                onValueChange={setSelectedProducts}
                            >
                                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-xs text-default-500">
                                            No products match your search.
                                        </p>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <Checkbox key={product.id} value={product.id}>
                                                <span className="text-sm">{product.name}</span>
                                            </Checkbox>
                                        ))
                                    )}
                                </div>
                            </CheckboxGroup>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { AlertTriangle, Package } from "lucide-react";
import { api } from "@/lib/api/api";
import type { ProductData, PaginatedResponse } from "@/types/api";

interface LowStockAlertsProps {
    threshold?: number;
}

export default function LowStockAlerts({ threshold = 10 }: LowStockAlertsProps) {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get<PaginatedResponse<ProductData>>("/api/products?limit=100");
            const lowStockProducts = (response.data || [])
                .filter(p => p.stock <= threshold)
                .sort((a, b) => a.stock - b.stock);
            setProducts(lowStockProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardBody className="text-center py-8 text-default-500">
                    Loading stock alerts...
                </CardBody>
            </Card>
        );
    }

    if (products.length === 0) {
        return (
            <Card className="w-full bg-success-50">
                <CardBody className="flex items-center gap-3 py-4">
                    <Package size={20} className="text-success" />
                    <span className="text-success-600">All products have sufficient stock!</span>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-warning" />
                <h3 className="font-semibold">Low Stock Alerts</h3>
                <Chip size="sm" color="warning" variant="flat">
                    {products.length} product{products.length !== 1 ? "s" : ""}
                </Chip>
            </CardHeader>
            <CardBody className="space-y-2">
                {products.slice(0, 5).map((product) => (
                    <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-warning-50 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-default-200 rounded flex items-center justify-center">
                                    <Package size={16} />
                                </div>
                            )}
                            <span className="font-medium">{product.name}</span>
                        </div>
                        <Chip
                            size="sm"
                            color={product.stock === 0 ? "danger" : "warning"}
                            variant="flat"
                        >
                            {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                        </Chip>
                    </div>
                ))}
                {products.length > 5 && (
                    <p className="text-sm text-default-500 text-center pt-2">
                        +{products.length - 5} more products with low stock
                    </p>
                )}
            </CardBody>
        </Card>
    );
}

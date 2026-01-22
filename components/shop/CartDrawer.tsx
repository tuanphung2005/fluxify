"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { X, Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Image as HeroUIImage } from "@heroui/image";
import { useState, useEffect, useCallback } from "react";
import CheckoutModal from "./CheckoutModal";
import { formatVND } from "@/lib/format";
import { api } from "@/lib/api/api";
import { getVariantStock } from "@/lib/variant-utils";

interface ProductStockInfo {
    id: string;
    stock: number;
    variantStock?: Record<string, number>;
}

export default function CartDrawer() {
    const { isOpen, setIsOpen, getItems, removeItem, updateQuantity, currentVendorName, currentVendorId } = useCartStore();
    const items = getItems();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [stockData, setStockData] = useState<Record<string, ProductStockInfo>>({});
    const [isValidating, setIsValidating] = useState(false);

    // Validate stock when drawer opens
    const validateStock = useCallback(async () => {
        if (!currentVendorId || items.length === 0) return;

        setIsValidating(true);
        try {
            // Fetch current stock for all products in cart
            const productIds = Array.from(new Set(items.map(item => item.id)));
            const stockInfo: Record<string, ProductStockInfo> = {};

            for (const productId of productIds) {
                try {
                    const product = await api.get(`/api/products/${productId}`) as any;
                    stockInfo[productId] = {
                        id: productId,
                        stock: product.stock || 0,
                        variantStock: product.variantStock || undefined,
                    };
                } catch (error) {
                    // Product might have been deleted
                    stockInfo[productId] = {
                        id: productId,
                        stock: 0,
                        variantStock: undefined,
                    };
                }
            }

            setStockData(stockInfo);
        } catch (error) {
            console.error("Failed to validate stock:", error);
        } finally {
            setIsValidating(false);
        }
    }, [currentVendorId, items]);

    useEffect(() => {
        if (isOpen) {
            validateStock();
        }
    }, [isOpen, validateStock]);

    // Check if an item is in stock
    const isItemInStock = (item: typeof items[0]): boolean => {
        const productStock = stockData[item.id];
        if (!productStock) return true; // Assume in stock if not validated yet

        const stock = getVariantStock(productStock, item.selectedVariant);
        return stock > 0;
    };

    // Get available stock for an item
    const getItemStock = (item: typeof items[0]): number => {
        const productStock = stockData[item.id];
        if (!productStock) return 999; // Assume available if not validated

        return getVariantStock(productStock, item.selectedVariant);
    };

    // Filter items for checkout total (only in-stock items)
    const availableItems = items.filter(isItemInStock);
    const unavailableItems = items.filter(item => !isItemInStock(item));
    const availableTotal = availableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Remove all unavailable items
    const handleRemoveUnavailable = () => {
        unavailableItems.forEach(item => {
            removeItem(item.id, item.selectedVariant);
        });
    };

    const handleCheckout = () => {
        if (unavailableItems.length > 0) {
            // Remove unavailable items before checkout
            handleRemoveUnavailable();
        }
        setIsOpen(false);
        setIsCheckoutOpen(true);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl z-50 flex flex-col border-l border-divider"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-divider">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={20} />
                                    <h2 className="text-lg font-semibold">Giỏ hàng ({items.length})</h2>
                                </div>
                                <Button isIconOnly variant="light" onPress={() => setIsOpen(false)}>
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* Unavailable items warning */}
                            {unavailableItems.length > 0 && (
                                <div className="mx-4 mt-4 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={18} className="text-danger mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-danger font-medium">
                                                {unavailableItems.length} sản phẩm không còn hàng
                                            </p>
                                            <p className="text-xs text-danger-500 mt-1">
                                                Các sản phẩm này sẽ không được tính vào đơn hàng
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            onPress={handleRemoveUnavailable}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <ScrollShadow className="flex-1 p-4">
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-default-500 gap-4">
                                        <ShoppingBag size={48} className="opacity-20" />
                                        <p>Giỏ hàng trống</p>
                                        <Button color="primary" variant="flat" onPress={() => setIsOpen(false)}>
                                            Tiếp tục mua sắm
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item) => {
                                            // Create unique key including variant
                                            const itemKey = `${item.id}-${item.selectedVariant || 'default'}`;
                                            const inStock = isItemInStock(item);
                                            const availableStock = getItemStock(item);

                                            return (
                                                <div
                                                    key={itemKey}
                                                    className={`flex gap-4 p-3 rounded-lg transition-all ${inStock
                                                        ? "bg-default-50"
                                                        : "bg-danger-50/50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800"
                                                        }`}
                                                >
                                                    {item.image ? (
                                                        <HeroUIImage
                                                            src={item.image}
                                                            alt={item.name}
                                                            className={`w-20 h-20 object-cover rounded-md ${!inStock ? "opacity-50 grayscale" : ""}`}
                                                            width={80}
                                                            height={80}
                                                        />
                                                    ) : (
                                                        <div className={`w-20 h-20 bg-default-200 rounded-md flex items-center justify-center text-xs text-default-500 ${!inStock ? "opacity-50" : ""}`}>
                                                            Không có ảnh
                                                        </div>
                                                    )}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className={`font-medium line-clamp-1 ${!inStock ? "text-default-400" : ""}`}>
                                                                {item.name}
                                                            </h3>
                                                            {item.variantDisplay && (
                                                                <p className="text-xs text-default-500 mt-1">{item.variantDisplay}</p>
                                                            )}
                                                            {!inStock ? (
                                                                <p className="text-xs text-danger font-medium mt-1">
                                                                    Loại sản phẩm này không còn hàng
                                                                </p>
                                                            ) : (
                                                                <p className="text-primary font-semibold">{formatVND(item.price)}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            {inStock ? (
                                                                <div className="flex items-center gap-2 bg-background rounded-md border border-divider">
                                                                    <button
                                                                        className="p-1 hover:bg-default-100 rounded-l-md"
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariant)}
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                                    <button
                                                                        className="p-1 hover:bg-default-100 rounded-r-md disabled:opacity-50"
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariant)}
                                                                        disabled={item.quantity >= availableStock}
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-danger-400 line-through">
                                                                    {formatVND(item.price)}
                                                                </span>
                                                            )}
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                color="danger"
                                                                variant="light"
                                                                onPress={() => removeItem(item.id, item.selectedVariant)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollShadow>

                            {items.length > 0 && (
                                <div className="p-4 border-t border-divider bg-content1">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-default-500">Tạm tính</span>
                                        <div className="text-right">
                                            <span className="text-xl font-bold">{formatVND(availableTotal)}</span>
                                            {unavailableItems.length > 0 && (
                                                <p className="text-xs text-default-400">
                                                    ({availableItems.length} sản phẩm có sẵn)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full font-semibold"
                                        onPress={handleCheckout}
                                        isDisabled={availableItems.length === 0}
                                        isLoading={isValidating}
                                    >
                                        {availableItems.length === 0
                                            ? "Không có sản phẩm khả dụng"
                                            : unavailableItems.length > 0
                                                ? `Thanh toán (${availableItems.length} sản phẩm)`
                                                : "Thanh toán"
                                        }
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <CheckoutModal isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
        </>
    );
}

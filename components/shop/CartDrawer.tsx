"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Image as HeroUIImage } from "@heroui/image";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";
import { formatVND } from "@/lib/format";

export default function CartDrawer() {
    const { isOpen, setIsOpen, getItems, removeItem, updateQuantity, total, currentVendorName } = useCartStore();
    const items = getItems();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleCheckout = () => {
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
                                            
                                            return (
                                                <div key={itemKey} className="flex gap-4 p-3 bg-default-50 rounded-lg">
                                                    {item.image ? (
                                                        <HeroUIImage
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-20 h-20 object-cover rounded-md"
                                                            width={80}
                                                            height={80}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-default-200 rounded-md flex items-center justify-center text-xs text-default-500">
                                                            Không có ảnh
                                                        </div>
                                                    )}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                                            {item.variantDisplay && (
                                                                <p className="text-xs text-default-500 mt-1">{item.variantDisplay}</p>
                                                            )}
                                                            <p className="text-primary font-semibold">{formatVND(item.price)}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 bg-background rounded-md border border-divider">
                                                                <button
                                                                    className="p-1 hover:bg-default-100 rounded-l-md"
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariant)}
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                                <button
                                                                    className="p-1 hover:bg-default-100 rounded-r-md"
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariant)}
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
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
                                        <span className="text-xl font-bold">{formatVND(total())}</span>
                                    </div>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full font-semibold"
                                        onPress={handleCheckout}
                                    >
                                        Thanh toán
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

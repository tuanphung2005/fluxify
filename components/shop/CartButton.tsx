"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function CartButton() {
    const { getItems, setIsOpen } = useCartStore();
    const [itemCount, setItemCount] = useState(0);

    // Defer cart count to client-side to avoid hydration mismatch
    useEffect(() => {
        const items = getItems();
        setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }, [getItems]);

    // Subscribe to store changes
    useEffect(() => {
        const unsubscribe = useCartStore.subscribe(() => {
            const items = getItems();
            setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
        });
        return unsubscribe;
    }, [getItems]);

    return (
        <Badge
            content={itemCount}
            color="primary"
            isInvisible={itemCount === 0}
            placement="top-right"
        >
            <Button
                isIconOnly
                color="primary"
                size="lg"
                className="shadow-lg"
                onPress={() => setIsOpen(true)}
                aria-label="Mở giỏ hàng"
            >
                <ShoppingCart size={24} />
            </Button>
        </Badge>
    );
}

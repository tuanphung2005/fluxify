"use client";

import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function CartButton() {
    const { getItems, setIsOpen } = useCartStore();
    const items = getItems();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
                aria-label="Open cart"
            >
                <ShoppingCart size={24} />
            </Button>
        </Badge>
    );
}

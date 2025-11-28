"use client";

import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function CartButton() {
    const { items, setIsOpen } = useCartStore();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="fixed bottom-6 right-6 z-50">
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
        </div>
    );
}

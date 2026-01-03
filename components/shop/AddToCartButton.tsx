"use client";

import { Button } from "@heroui/button";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

interface AddToCartButtonProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
    };
    vendorId: string;
    vendorName: string;
    disabled?: boolean;
}

export default function AddToCartButton({ product, vendorId, vendorName, disabled }: AddToCartButtonProps) {
    const { addItem, setIsOpen } = useCartStore();

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            vendorId,
            vendorName,
        });
        setIsOpen(true);
    };

    return (
        <Button
            size="lg"
            color="primary"
            className="w-full md:w-auto font-semibold px-8"
            startContent={<ShoppingCart />}
            onPress={handleAddToCart}
            isDisabled={disabled}
        >
            {disabled ? "Out of Stock" : "Add to Cart"}
        </Button>
    );
}


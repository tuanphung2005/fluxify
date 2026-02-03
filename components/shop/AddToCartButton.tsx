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
  vendorId?: string; // TODO: REMOVE
  vendorName?: string; // TODO: REMOVE
  disabled?: boolean;
}

export default function AddToCartButton({
  product,
  disabled,
}: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    setIsOpen(true);
  };

  return (
    <Button
      className="w-full md:w-auto font-semibold px-8"
      color="primary"
      isDisabled={disabled}
      size="lg"
      startContent={<ShoppingCart />}
      onPress={handleAddToCart}
    >
      {disabled ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}

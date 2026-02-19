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
  disabled?: boolean;
  vendorId?: string;
  vendorName?: string;
}

export default function AddToCartButton({
  product,
  disabled,
  vendorId,
  vendorName,
}: AddToCartButtonProps) {
  const { addItem, setIsOpen, currentVendorId, setCurrentVendor } =
    useCartStore();

  const handleAddToCart = () => {
    if (vendorId && vendorId !== currentVendorId) {
      setCurrentVendor(vendorId, vendorName || null);
    }
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

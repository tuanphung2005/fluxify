"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ProductModal from "@/components/shop/ProductModal";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  stock: number;
  images: string[];
  variants: any;
}

interface ShopProductModalManagerProps {
  products: Product[];
  vendorId: string;
  vendorName: string;
}

export default function ShopProductModalManager({
  products,
  vendorId,
  vendorName,
}: ShopProductModalManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const productId = searchParams.get("productId");

  const selectedProduct = productId
    ? products.find((p) => p.id === productId) || null
    : null;
  const isOpen = !!selectedProduct;

  const handleClose = () => {
    // Remove query param
    const params = new URLSearchParams(searchParams.toString());

    params.delete("productId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!selectedProduct) return null;

  return (
    <ProductModal
      isOpen={isOpen}
      product={selectedProduct}
      vendorId={vendorId}
      vendorName={vendorName}
      onClose={handleClose}
    />
  );
}

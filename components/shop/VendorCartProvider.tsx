"use client";

import { useRef } from "react";

import { useCartStore } from "@/store/cart-store";

interface VendorCartProviderProps {
  vendorId: string;
  vendorName: string;
  children: React.ReactNode;
}

/**
 * Sets the current vendor context for the cart store.
 * Place this at the top of shop pages to ensure cart operations
 * target the correct vendor's cart.
 */
export default function VendorCartProvider({
  vendorId,
  vendorName,
  children,
}: VendorCartProviderProps) {
  const setCurrentVendor = useCartStore((state) => state.setCurrentVendor);
  const prevRef = useRef({ vendorId: "", vendorName: "" });

  // Sync vendor context during render instead of useEffect (avoids derived-state-effect)
  if (
    prevRef.current.vendorId !== vendorId ||
    prevRef.current.vendorName !== vendorName
  ) {
    prevRef.current = { vendorId, vendorName };
    setCurrentVendor(vendorId, vendorName);
  }

  return <>{children}</>;
}

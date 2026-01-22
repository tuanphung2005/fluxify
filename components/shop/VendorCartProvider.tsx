"use client";

import { useEffect } from "react";

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

  useEffect(() => {
    setCurrentVendor(vendorId, vendorName);

    // Clear vendor context on unmount (optional, keeps context for navigation)
    // return () => setCurrentVendor(null, null);
  }, [vendorId, vendorName, setCurrentVendor]);

  return <>{children}</>;
}

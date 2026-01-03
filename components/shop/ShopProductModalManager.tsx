"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductModal from "@/components/shop/ProductModal";
import { useEffect, useState } from "react";

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

export default function ShopProductModalManager({ products, vendorId, vendorName }: ShopProductModalManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const productId = searchParams.get("productId");

    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                setSelectedProduct(product);
                setIsOpen(true);
            }
        } else {
            setIsOpen(false);
        }
    }, [productId, products]);

    const handleClose = () => {
        setIsOpen(false);
        // Remove query param
        const params = new URLSearchParams(searchParams.toString());
        params.delete("productId");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (!selectedProduct) return null;

    return (
        <ProductModal
            product={selectedProduct}
            vendorId={vendorId}
            vendorName={vendorName}
            isOpen={isOpen}
            onClose={handleClose}
        />
    );
}


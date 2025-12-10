"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Image } from "@heroui/image";
import { Search, Package } from "lucide-react";
import { Spinner } from "@heroui/spinner";

interface Product {
    id: string;
    name: string;
    price: number | string;
    stock: number;
    images?: string[];
}

interface ProductSelectorModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    products: Product[];
    selectedProductIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    isLoading?: boolean;
}

export default function ProductSelectorModal({
    isOpen,
    onOpenChange,
    products,
    selectedProductIds,
    onSelectionChange,
    isLoading = false,
}: ProductSelectorModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [localSelection, setLocalSelection] = useState<string[]>(selectedProductIds);

    // Sync local selection with props when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalSelection(selectedProductIds);
            setSearchQuery("");
        }
    }, [isOpen, selectedProductIds]);

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        return (products || []).filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleToggleProduct = (productId: string) => {
        setLocalSelection((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        const allFilteredIds = filteredProducts.map((p) => p.id);
        const allSelected = allFilteredIds.every((id) => localSelection.includes(id));

        if (allSelected) {
            // Deselect all filtered products
            setLocalSelection((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
        } else {
            // Select all filtered products
            setLocalSelection((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
        }
    };

    const handleConfirm = () => {
        onSelectionChange(localSelection);
        onOpenChange(false);
    };

    const handleClear = () => {
        setLocalSelection([]);
    };

    const allFilteredSelected = filteredProducts.length > 0 &&
        filteredProducts.every((p) => localSelection.includes(p.id));

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h3>Select Products</h3>
                            <p className="text-sm text-default-500 font-normal">
                                {localSelection.length} product{localSelection.length !== 1 ? "s" : ""} selected
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                    startContent={<Search size={18} className="text-default-400" />}
                                    className="flex-1"
                                />
                                <Button
                                    variant="flat"
                                    size="md"
                                    onPress={handleSelectAll}
                                    isDisabled={filteredProducts.length === 0}
                                >
                                    {allFilteredSelected ? "Deselect All" : "Select All"}
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Spinner size="lg" />
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-default-500">
                                    <Package size={48} className="mb-4 opacity-50" />
                                    <p>
                                        {searchQuery
                                            ? "No products match your search"
                                            : "No products available"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {filteredProducts.map((product) => {
                                        const isSelected = localSelection.includes(product.id);
                                        const imageUrl = product.images?.[0] || "/placeholder-product.png";

                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => handleToggleProduct(product.id)}
                                                className={`
                                                    relative cursor-pointer rounded-lg border-2 p-3 transition-all
                                                    ${isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-default-200 hover:border-default-400"
                                                    }
                                                `}
                                            >
                                                <div className="absolute top-2 right-2 z-20 rounded-full">
                                                    <Checkbox
                                                        isSelected={isSelected}
                                                        onValueChange={() => handleToggleProduct(product.id)}
                                                        size="lg"
                                                    />
                                                </div>
                                                <div className="aspect-square mb-2 overflow-hidden rounded-md bg-default-100 relative z-0">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackSrc="/placeholder-product.png"
                                                    />
                                                </div>
                                                <p className="text-sm font-medium line-clamp-2">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-default-500 mt-1">
                                                    ${typeof product.price === "number"
                                                        ? product.price.toFixed(2)
                                                        : product.price}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={handleClear}
                                isDisabled={localSelection.length === 0}
                            >
                                Clear Selection
                            </Button>
                            <div className="flex-1" />
                            <Button variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleConfirm}>
                                Confirm Selection
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

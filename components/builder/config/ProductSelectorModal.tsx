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
  const [localSelection, setLocalSelection] =
    useState<string[]>(selectedProductIds);

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
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const handleToggleProduct = (productId: string) => {
    setLocalSelection((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredProducts.map((p) => p.id);
    const allSelected = allFilteredIds.every((id) =>
      localSelection.includes(id),
    );

    if (allSelected) {
      // Deselect all filtered products
      setLocalSelection((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id)),
      );
    } else {
      // Select all filtered products
      setLocalSelection((prev) =>
        Array.from(new Set([...prev, ...allFilteredIds])),
      );
    }
  };

  const handleConfirm = () => {
    onSelectionChange(localSelection);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalSelection([]);
  };

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => localSelection.includes(p.id));

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3>Chọn sản phẩm</h3>
              <p className="text-sm text-default-500 font-normal">
                {localSelection.length} sản phẩm đã chọn
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex gap-2 mb-4">
                <Input
                  className="flex-1"
                  placeholder="Tìm kiếm sản phẩm..."
                  startContent={
                    <Search className="text-default-400" size={18} />
                  }
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <Button
                  isDisabled={filteredProducts.length === 0}
                  size="md"
                  variant="flat"
                  onPress={handleSelectAll}
                >
                  {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-default-500">
                  <Package className="mb-4 opacity-50" size={48} />
                  <p>
                    {searchQuery
                      ? "Không tìm thấy sản phẩm nào"
                      : "Không có sản phẩm nào"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const isSelected = localSelection.includes(product.id);
                    const imageUrl =
                      product.images?.[0] || "/placeholder-product.png";

                    return (
                      <div
                        key={product.id}
                        className={`
                                                    relative cursor-pointer rounded-lg border-2 p-3 transition-all
                                                    ${
                                                      isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-default-200 hover:border-default-400"
                                                    }
                                                `}
                        onClick={() => handleToggleProduct(product.id)}
                      >
                        <div className="absolute top-2 right-2 z-20 rounded-full">
                          <Checkbox
                            isSelected={isSelected}
                            size="lg"
                            onValueChange={() =>
                              handleToggleProduct(product.id)
                            }
                          />
                        </div>
                        <div className="aspect-square mb-2 overflow-hidden rounded-md bg-default-100 relative z-0">
                          <Image
                            alt={product.name}
                            className="w-full h-full object-cover"
                            fallbackSrc="/placeholder-product.png"
                            src={imageUrl}
                          />
                        </div>
                        <p className="text-sm font-medium line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-default-500 mt-1">
                          $
                          {typeof product.price === "number"
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
                isDisabled={localSelection.length === 0}
                variant="light"
                onPress={handleClear}
              >
                Xóa lựa chọn
              </Button>
              <div className="flex-1" />
              <Button variant="flat" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" onPress={handleConfirm}>
                Xác nhận
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

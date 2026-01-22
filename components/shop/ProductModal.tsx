"use client";

import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { X, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/store/cart-store";
import { toast } from "@/lib/toast";
import { formatVND } from "@/lib/format";
import {
  getVariantStock,
  getVariantStockStatus,
  generateVariantKey,
  hasVariants,
  isColorVariant,
  getVariantDisplayName,
  parseColorValue,
  type ColorVariantValue,
} from "@/lib/variant-utils";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  stock: number;
  images: string[];
  variants: any;
  variantStock?: any;
}

interface ProductModalProps {
  product: Product;
  vendorId: string;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({
  product,
  vendorId,
  vendorName,
  isOpen,
  onClose,
}: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const { addItem, setCurrentVendor } = useCartStore();

  // Parse variants if they exist
  let variants: { name: string; values: (string | ColorVariantValue)[] }[] = [];

  try {
    if (product.variants) {
      const variantsData =
        typeof product.variants === "string"
          ? JSON.parse(product.variants)
          : product.variants;

      if (typeof variantsData === "object" && variantsData !== null) {
        variants = Object.entries(variantsData).map(([name, values]) => ({
          name,
          values: Array.isArray(values) ? values : [],
        }));
      }
    }
  } catch (e) {
    console.error("Error parsing variants", e);
  }

  const hasProductVariants = hasVariants(product);
  const allVariantsSelected = hasProductVariants
    ? variants.every((v) => selectedVariants[v.name])
    : true;

  // Get current variant key and stock
  const currentVariantKey =
    allVariantsSelected && hasProductVariants
      ? generateVariantKey(selectedVariants)
      : undefined;

  const currentStock = getVariantStock(product, currentVariantKey);
  const stockStatus = getVariantStockStatus(product, currentVariantKey);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  const handleVariantSelect = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (hasProductVariants && !allVariantsSelected) {
      toast.error("Vui lòng chọn đầy đủ tùy chọn sản phẩm");

      return;
    }

    if (currentStock <= 0) {
      toast.error("Sản phẩm đã hết hàng");

      return;
    }

    setCurrentVendor(vendorId, vendorName);

    const variantDisplay =
      hasProductVariants && currentVariantKey
        ? Object.entries(selectedVariants)
            .map(([name, value]) => `${name}: ${value}`)
            .join(", ")
        : undefined;

    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
      selectedVariant: currentVariantKey,
      variantDisplay,
    });

    toast.success("Đã thêm vào giỏ hàng!");
  };

  const hasMultipleImages = product.images.length > 1;

  return (
    <Modal
      classNames={{
        body: "p-0",
        base: "bg-background",
        closeButton: "hidden",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="5xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalBody>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[600px]">
            <Button
              isIconOnly
              className="absolute right-4 top-4 z-50"
              variant="light"
              onPress={onClose}
            >
              <X size={24} />
            </Button>

            {/* Product Image Carousel */}
            <div className="relative bg-default-50 w-full h-[600px] flex items-center justify-center">
              {product.images[currentImageIndex] ? (
                <Image
                  removeWrapper
                  alt={product.name}
                  className="w-full h-full object-contain"
                  src={product.images[currentImageIndex]}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-default-300">
                  Không có hình ảnh
                </div>
              )}

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <Button
                    isIconOnly
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm z-10 shadow-lg"
                    size="sm"
                    variant="flat"
                    onPress={handlePrevImage}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <Button
                    isIconOnly
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm z-10 shadow-lg"
                    size="sm"
                    variant="flat"
                    onPress={handleNextImage}
                  >
                    <ChevronRight size={20} />
                  </Button>
                </>
              )}

              {/* Dot Indicators */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-background/60 backdrop-blur-sm px-3 py-2 rounded-full">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      aria-label={`Đến hình ${index + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-primary w-6"
                          : "bg-default-400 hover:bg-default-500 w-2"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8 md:p-12 flex flex-col gap-6 h-full overflow-y-auto">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {product.name}
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {formatVND(product.price)}
                </p>
              </div>

              {/* Stock Status */}
              {stockStatus === "out_of_stock" ? (
                <Chip color="default" size="lg" variant="flat">
                  Hết hàng
                </Chip>
              ) : stockStatus === "low_stock" ? (
                <Chip color="warning" size="lg" variant="flat">
                  Sắp hết: {currentStock} sản phẩm
                </Chip>
              ) : (
                <Chip color="success" size="lg" variant="flat">
                  Còn hàng
                </Chip>
              )}

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-default-500 text-lg leading-relaxed">
                  {product.description || "Không có mô tả."}
                </p>
              </div>

              {/* Variants Selection */}
              {variants.length > 0 && (
                <div className="space-y-4 py-4 border-y border-divider">
                  {variants.map((variant, index) => (
                    <div key={index}>
                      <h3 className="font-semibold mb-2">
                        {variant.name}
                        {!selectedVariants[variant.name] && (
                          <span className="text-danger text-sm ml-2">*</span>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {variant.values.map((value, vIndex) => {
                          // Extract display name and color from value
                          const displayName = getVariantDisplayName(value);
                          const colorValue = parseColorValue(value);
                          const isThisColorVariant = isColorVariant(
                            variant.name,
                          );

                          // Calculate stock for this specific variant value
                          let variantStock = 0;
                          let isOutOfStock = false;

                          if (
                            product.variantStock &&
                            typeof product.variantStock === "object"
                          ) {
                            const variantStockData =
                              product.variantStock as Record<string, number>;

                            // Sum up stock for all combinations containing this variant value
                            Object.entries(variantStockData).forEach(
                              ([key, stock]) => {
                                // Parse the key to check if it contains this variant value
                                const keyParts = key.split(",").map((part) => {
                                  const [name, val] = part.split(":");

                                  return {
                                    name: name.trim(),
                                    value: val.trim(),
                                  };
                                });

                                // Check if any part matches our variant name and value (using display name)
                                const hasMatch = keyParts.some(
                                  (part) =>
                                    part.name === variant.name &&
                                    part.value === displayName,
                                );

                                if (hasMatch) {
                                  variantStock +=
                                    typeof stock === "number" ? stock : 0;
                                }
                              },
                            );

                            isOutOfStock = variantStock <= 0;
                          } else {
                            // Fallback to general stock if no variant stock defined
                            variantStock = product.stock;
                            isOutOfStock = product.stock <= 0;
                          }

                          const isSelected =
                            selectedVariants[variant.name] === displayName;

                          return (
                            <Chip
                              key={vIndex}
                              className={`cursor-pointer transition-all ${
                                isOutOfStock
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:scale-105"
                              }`}
                              color={isSelected ? "primary" : "default"}
                              startContent={
                                colorValue ? (
                                  <span
                                    className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
                                    style={{
                                      backgroundColor: colorValue.color,
                                    }}
                                  />
                                ) : undefined
                              }
                              variant={isSelected ? "solid" : "flat"}
                              onClick={() =>
                                !isOutOfStock &&
                                handleVariantSelect(variant.name, displayName)
                              }
                            >
                              {displayName} (
                              {isOutOfStock ? "Hết" : variantStock})
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {!allVariantsSelected && (
                    <p className="text-sm text-warning">
                      Vui lòng chọn đầy đủ tùy chọn để thêm vào giỏ hàng
                    </p>
                  )}
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="mt-auto pt-6">
                <Button
                  fullWidth
                  color="primary"
                  isDisabled={
                    currentStock <= 0 ||
                    (hasProductVariants && !allVariantsSelected)
                  }
                  size="lg"
                  startContent={<ShoppingCart size={20} />}
                  onPress={handleAddToCart}
                >
                  {currentStock <= 0
                    ? "Hết hàng"
                    : hasProductVariants && !allVariantsSelected
                      ? "Chọn tùy chọn"
                      : "Thêm vào giỏ hàng"}
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

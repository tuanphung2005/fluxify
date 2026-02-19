"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  hasVariants,
  isColorVariant,
  parseColorValue,
  getVariantDisplayName,
  type ColorVariantValue,
} from "@/lib/variant-utils";
import { formatVND } from "@/lib/format";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: string[];
  vendorId?: string;
  description?: string;
  isSale?: boolean;
  stockStatus?: StockStatus;
  showAddToCart?: boolean;
  onAddToCart?: (id: string) => void;
  onPress?: () => void;
  variants?: any;
  variantStock?: any;
}

/**
 * Unified ProductCard component with modern styling
 * Supports navigation to product page and optional Add to Cart button
 */
export default function ProductCard({
  id,
  name,
  price,
  images = [],
  vendorId,
  isSale = false,
  stockStatus = "in_stock",
  showAddToCart = false,
  onAddToCart,
  onPress,
  variants,
  variantStock,
}: ProductCardProps) {
  const router = useRouter();
  const productHasVariants = hasVariants({ variants });

  const handleCardClick = () => {
    if (onPress) {
      onPress();
    } else if (vendorId) {
      // Use query param to open modal instead of navigating to new page
      router.push(`/shop/${vendorId}?productId=${id}`, { scroll: false });
    }
  };

  const handleAddToCart = () => {
    // If product has variants, open modal instead of adding directly
    if (productHasVariants) {
      handleCardClick();
    } else {
      onAddToCart?.(id);
    }
  };

  const isOutOfStock = stockStatus === "out_of_stock";
  const hasButton = showAddToCart && !isOutOfStock;

  return (
    <Card
      className="overflow-hidden group"
      isPressable={!hasButton}
      onPress={!hasButton ? handleCardClick : undefined}
    >
      {/* Image Section */}
      <div
        className={`relative aspect-square overflow-hidden ${hasButton ? "cursor-pointer" : ""}`}
        role={hasButton ? "button" : undefined}
        tabIndex={hasButton ? 0 : undefined}
        onClick={hasButton ? handleCardClick : undefined}
        onKeyDown={(e) => {
          if (hasButton && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <Image
          removeWrapper
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={images[0] || "/placeholder.png"}
        />
        {/* Sale Badge */}
        {isSale && (
          <Chip
            className="absolute top-2 left-2 z-10"
            color="danger"
            size="sm"
            variant="flat"
          >
            Giảm giá
          </Chip>
        )}
        {/* Low Stock Badge */}
        {stockStatus === "low_stock" && (
          <Chip
            className="absolute top-2 right-2 z-10"
            color="warning"
            size="sm"
            variant="flat"
          >
            Sắp hết
          </Chip>
        )}
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
            <Chip color="default" variant="solid">
              Hết hàng
            </Chip>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardBody
        className={`p-4 ${hasButton ? "cursor-pointer" : ""}`}
        role={hasButton ? "button" : undefined}
        tabIndex={hasButton ? 0 : undefined}
        onClick={hasButton ? handleCardClick : undefined}
        onKeyDown={(e) => {
          if (hasButton && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <h3 className="font-semibold line-clamp-1">{name}</h3>
        <p className="text-lg font-bold text-primary">{formatVND(price)}</p>
        {productHasVariants && (
          <div className="mt-1 space-y-1">
            {/* Color swatches if color variant exists */}
            {(() => {
              try {
                const parsedVariants =
                  typeof variants === "string"
                    ? JSON.parse(variants)
                    : variants;

                if (!parsedVariants || typeof parsedVariants !== "object")
                  return null;

                // Find color variant
                const colorEntry = Object.entries(parsedVariants).find(
                  ([name]) => isColorVariant(name),
                );

                if (colorEntry) {
                  const [, colorValues] = colorEntry;
                  const colors = Array.isArray(colorValues) ? colorValues : [];

                  return (
                    <div className="flex gap-1 flex-wrap">
                      {colors.slice(0, 5).map((colorVal, idx) => {
                        const parsed = parseColorValue(
                          colorVal as string | ColorVariantValue,
                        );

                        if (parsed) {
                          return (
                            <span
                              key={idx}
                              className="w-4 h-4 rounded-full border border-default-300"
                              style={{ backgroundColor: parsed.color }}
                              title={parsed.name}
                            />
                          );
                        }

                        return null;
                      })}
                      {colors.length > 5 && (
                        <span className="text-xs text-default-400">
                          +{colors.length - 5}
                        </span>
                      )}
                    </div>
                  );
                }

                return null;
              } catch {
                return null;
              }
            })()}
            <p className="text-xs text-default-500">
              {(() => {
                try {
                  const parsedVariants =
                    typeof variants === "string"
                      ? JSON.parse(variants)
                      : variants;

                  if (!parsedVariants || typeof parsedVariants !== "object")
                    return "Nhiều tùy chọn";

                  const entries = Object.entries(parsedVariants).filter(
                    ([name]) => !isColorVariant(name),
                  );

                  if (entries.length === 0) return "Nhiều màu sắc";

                  const maxVariants = 2;
                  const maxValuesPerVariant = 3;

                  const displayParts = entries
                    .slice(0, maxVariants)
                    .map(([name, values]) => {
                      const valuesArr = Array.isArray(values)
                        ? values.map((v) => getVariantDisplayName(v))
                        : [];
                      const displayValues = valuesArr
                        .slice(0, maxValuesPerVariant)
                        .join(", ");
                      const suffix =
                        valuesArr.length > maxValuesPerVariant ? "..." : "";

                      return `${name}: ${displayValues}${suffix}`;
                    });

                  const result = displayParts.join(" | ");

                  if (entries.length > maxVariants) {
                    return result + " +" + (entries.length - maxVariants);
                  }

                  return result || "Nhiều tùy chọn";
                } catch {
                  return "Nhiều tùy chọn";
                }
              })()}
            </p>
            {variantStock && typeof variantStock === "object" && (
              <p className="text-xs text-default-600">
                Tồn kho:{" "}
                {Object.values(variantStock as Record<string, number>).reduce(
                  (sum: number, stock) =>
                    sum + (typeof stock === "number" ? stock : 0),
                  0,
                )}{" "}
                sản phẩm
              </p>
            )}
          </div>
        )}
      </CardBody>

      {/* Add to Cart Button */}
      {hasButton && (
        <CardFooter className="pt-0">
          <Button
            fullWidth
            color="primary"
            startContent={<ShoppingCart size={18} />}
            variant="flat"
            onPress={handleAddToCart}
          >
            {productHasVariants ? "Chọn tùy chọn" : "Thêm vào giỏ"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

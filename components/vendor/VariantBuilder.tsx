"use client";

import { useState, useEffect } from "react";
import { Button, Input, Chip } from "@heroui/react";
import { Plus, X, Package, Palette } from "lucide-react";

import {
  getAllVariantCombinations,
  parseVariantKey,
  isColorVariant,
  getVariantDisplayName,
  parseColorValue,
  type VariantOption,
  type ColorVariantValue,
} from "@/lib/variant-utils";

interface VariantBuilderProps {
  value: string; // JSON string of variants
  stockValue?: string; // JSON string of variant stock
  onChange: (value: string) => void;
  onStockChange?: (value: string) => void;
}

export default function VariantBuilder({
  value,
  stockValue,
  onChange,
  onStockChange,
}: VariantBuilderProps) {
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [variantStock, setVariantStock] = useState<Record<string, number>>({});
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantValue, setNewVariantValue] = useState("");
  const [newVariantColor, setNewVariantColor] = useState("#3B82F6"); // Default blue
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(
    null,
  );

  // Load variants from prop
  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value);
        const variantArray = Object.entries(parsed).map(([name, values]) => ({
          name,
          values: Array.isArray(values) ? values : [],
        }));

        setVariants(variantArray);
      } else {
        setVariants([]);
      }
    } catch (e) {
      console.error("Invalid variant JSON", e);
      setVariants([]);
    }
  }, [value]);

  // Load variant stock from prop
  useEffect(() => {
    try {
      if (stockValue) {
        const parsed = JSON.parse(stockValue);

        setVariantStock(parsed || {});
      } else {
        setVariantStock({});
      }
    } catch (e) {
      console.error("Invalid variant stock JSON", e);
      setVariantStock({});
    }
  }, [stockValue]);

  // Update parent whenever variants change
  const updateParent = (newVariants: VariantOption[]) => {
    const variantObject = newVariants.reduce(
      (acc, variant) => {
        if (variant.name && variant.values.length > 0) {
          acc[variant.name] = variant.values;
        }

        return acc;
      },
      {} as Record<string, (string | ColorVariantValue)[]>,
    );

    onChange(
      Object.keys(variantObject).length > 0
        ? JSON.stringify(variantObject, null, 2)
        : "",
    );
  };

  // Update stock parent
  const updateStockParent = (newStock: Record<string, number>) => {
    if (onStockChange) {
      onStockChange(
        Object.keys(newStock).length > 0
          ? JSON.stringify(newStock, null, 2)
          : "",
      );
    }
  };

  const addVariant = () => {
    if (!newVariantName.trim()) return;
    const newVariants = [...variants, { name: newVariantName, values: [] }];

    setVariants(newVariants);
    setNewVariantName("");
    updateParent(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);

    setVariants(newVariants);
    updateParent(newVariants);

    // Regenerate stock for new combinations
    const combinations = getAllVariantCombinations(newVariants);
    const newStock: Record<string, number> = {};

    combinations.forEach((combo) => {
      newStock[combo] = variantStock[combo] || 0;
    });
    setVariantStock(newStock);
    updateStockParent(newStock);
  };

  const addValueToVariant = (index: number) => {
    if (!newVariantValue.trim()) return;
    const newVariants = [...variants];
    const variant = newVariants[index];
    const isColor = isColorVariant(variant.name);

    // Check if value already exists
    const existingValue = variant.values.find(
      (v) => getVariantDisplayName(v) === newVariantValue.trim(),
    );

    if (!existingValue) {
      // Add as ColorVariantValue if it's a color variant, otherwise as string
      if (isColor) {
        variant.values.push({
          name: newVariantValue.trim(),
          color: newVariantColor,
        });
      } else {
        variant.values.push(newVariantValue.trim());
      }
      setVariants(newVariants);
      updateParent(newVariants);

      // Regenerate stock for new combinations
      const combinations = getAllVariantCombinations(newVariants);
      const newStock: Record<string, number> = {};

      combinations.forEach((combo) => {
        newStock[combo] = variantStock[combo] || 0;
      });
      setVariantStock(newStock);
      updateStockParent(newStock);
    }
    setNewVariantValue("");
    setNewVariantColor("#3B82F6"); // Reset to default blue
  };

  const removeValueFromVariant = (variantIndex: number, valueIndex: number) => {
    const newVariants = [...variants];

    newVariants[variantIndex].values = newVariants[variantIndex].values.filter(
      (_, i) => i !== valueIndex,
    );
    setVariants(newVariants);
    updateParent(newVariants);

    // Regenerate stock for new combinations
    const combinations = getAllVariantCombinations(newVariants);
    const newStock: Record<string, number> = {};

    combinations.forEach((combo) => {
      newStock[combo] = variantStock[combo] || 0;
    });
    setVariantStock(newStock);
    updateStockParent(newStock);
  };

  const updateVariantStock = (variantKey: string, stock: number) => {
    const newStock = { ...variantStock, [variantKey]: stock };

    setVariantStock(newStock);
    updateStockParent(newStock);
  };

  // Get all variant combinations
  const combinations = getAllVariantCombinations(variants);

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg border-default-200">
      {/* Variant Definition Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Tùy chọn sản phẩm</h3>
        <div className="flex gap-2 items-end mb-4">
          <Input
            label="Tên tùy chọn (VD: Kích thước, Màu sắc)"
            size="sm"
            value={newVariantName}
            onKeyDown={(e) => e.key === "Enter" && addVariant()}
            onValueChange={setNewVariantName}
          />
          <Button isIconOnly color="primary" size="sm" onPress={addVariant}>
            <Plus size={16} />
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-3 bg-default-50 rounded-md"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{variant.name}</span>
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => removeVariant(index)}
                >
                  <X size={14} />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {variant.values.map((val, vIndex) => {
                  const colorValue = parseColorValue(val);
                  const displayName = getVariantDisplayName(val);

                  return (
                    <Chip
                      key={vIndex}
                      size="sm"
                      startContent={
                        colorValue ? (
                          <span
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{ backgroundColor: colorValue.color }}
                          />
                        ) : undefined
                      }
                      variant="flat"
                      onClose={() => removeValueFromVariant(index, vIndex)}
                    >
                      {displayName}
                    </Chip>
                  );
                })}
              </div>

              <div className="flex gap-2">
                {isColorVariant(variant.name) && (
                  <div className="relative">
                    <input
                      className="w-10 h-10 rounded-lg cursor-pointer border-2 border-default-200"
                      title="Chọn màu"
                      type="color"
                      value={
                        activeVariantIndex === index
                          ? newVariantColor
                          : "#3B82F6"
                      }
                      onChange={(e) => {
                        setActiveVariantIndex(index);
                        setNewVariantColor(e.target.value);
                      }}
                    />
                  </div>
                )}
                <Input
                  placeholder={
                    isColorVariant(variant.name)
                      ? "Tên màu (VD: Xanh dương)"
                      : `Thêm ${variant.name}`
                  }
                  size="sm"
                  startContent={
                    isColorVariant(variant.name) ? (
                      <Palette className="text-default-400" size={16} />
                    ) : undefined
                  }
                  value={activeVariantIndex === index ? newVariantValue : ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addValueToVariant(index);
                    }
                  }}
                  onValueChange={(val) => {
                    setActiveVariantIndex(index);
                    setNewVariantValue(val);
                  }}
                />
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => addValueToVariant(index)}
                >
                  Thêm
                </Button>
              </div>
            </div>
          ))}
        </div>
        {variants.length === 0 && (
          <p className="text-tiny text-default-400 text-center">
            Chưa có tùy chọn nào.
          </p>
        )}
      </div>

      {/* Stock Management Section */}
      {combinations.length > 0 && onStockChange && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="text-default-500" size={16} />
            <h3 className="text-sm font-semibold">Tồn kho theo tùy chọn</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {combinations.map((combo) => {
              const parsed = parseVariantKey(combo);
              const displayName = Object.entries(parsed)
                .map(([name, value]) => `${name}: ${value}`)
                .join(", ");
              const stock = variantStock[combo] || 0;

              return (
                <div
                  key={combo}
                  className="flex items-center gap-2 p-2 bg-default-50 rounded-md"
                >
                  <span className="text-sm flex-1 truncate" title={displayName}>
                    {displayName}
                  </span>
                  <Input
                    className="w-24"
                    endContent={
                      <span className="text-tiny text-default-400">sp</span>
                    }
                    min={0}
                    size="sm"
                    type="number"
                    value={stock.toString()}
                    onValueChange={(val) => {
                      const num = parseInt(val) || 0;

                      updateVariantStock(combo, num);
                    }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-tiny text-default-400 mt-2">
            Tổng: {Object.values(variantStock).reduce((sum, s) => sum + s, 0)}{" "}
            sản phẩm
          </p>
        </div>
      )}
    </div>
  );
}

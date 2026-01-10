"use client";

import { useState, useEffect } from "react";
import { Button, Input, Chip } from "@heroui/react";
import { Plus, X, Package } from "lucide-react";
import { getAllVariantCombinations, parseVariantKey, type VariantOption } from "@/lib/variant-utils";

interface VariantBuilderProps {
    value: string; // JSON string of variants
    stockValue?: string; // JSON string of variant stock
    onChange: (value: string) => void;
    onStockChange?: (value: string) => void;
}

export default function VariantBuilder({ value, stockValue, onChange, onStockChange }: VariantBuilderProps) {
    const [variants, setVariants] = useState<VariantOption[]>([]);
    const [variantStock, setVariantStock] = useState<Record<string, number>>({});
    const [newVariantName, setNewVariantName] = useState("");
    const [newVariantValue, setNewVariantValue] = useState("");
    const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);

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
        const variantObject = newVariants.reduce((acc, variant) => {
            if (variant.name && variant.values.length > 0) {
                acc[variant.name] = variant.values;
            }
            return acc;
        }, {} as Record<string, string[]>);

        onChange(Object.keys(variantObject).length > 0 ? JSON.stringify(variantObject, null, 2) : "");
    };

    // Update stock parent
    const updateStockParent = (newStock: Record<string, number>) => {
        if (onStockChange) {
            onStockChange(Object.keys(newStock).length > 0 ? JSON.stringify(newStock, null, 2) : "");
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
        combinations.forEach(combo => {
            newStock[combo] = variantStock[combo] || 0;
        });
        setVariantStock(newStock);
        updateStockParent(newStock);
    };

    const addValueToVariant = (index: number) => {
        if (!newVariantValue.trim()) return;
        const newVariants = [...variants];
        if (!newVariants[index].values.includes(newVariantValue)) {
            newVariants[index].values.push(newVariantValue);
            setVariants(newVariants);
            updateParent(newVariants);
            
            // Regenerate stock for new combinations
            const combinations = getAllVariantCombinations(newVariants);
            const newStock: Record<string, number> = {};
            combinations.forEach(combo => {
                newStock[combo] = variantStock[combo] || 0;
            });
            setVariantStock(newStock);
            updateStockParent(newStock);
        }
        setNewVariantValue("");
    };

    const removeValueFromVariant = (variantIndex: number, valueIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values = newVariants[variantIndex].values.filter((_, i) => i !== valueIndex);
        setVariants(newVariants);
        updateParent(newVariants);
        
        // Regenerate stock for new combinations
        const combinations = getAllVariantCombinations(newVariants);
        const newStock: Record<string, number> = {};
        combinations.forEach(combo => {
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
                        value={newVariantName}
                        onValueChange={setNewVariantName}
                        size="sm"
                        onKeyDown={(e) => e.key === "Enter" && addVariant()}
                    />
                    <Button isIconOnly color="primary" size="sm" onPress={addVariant}>
                        <Plus size={16} />
                    </Button>
                </div>

                <div className="flex flex-col gap-4">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex flex-col gap-2 p-3 bg-default-50 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm">{variant.name}</span>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    onPress={() => removeVariant(index)}
                                >
                                    <X size={14} />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {variant.values.map((val, vIndex) => (
                                    <Chip
                                        key={vIndex}
                                        onClose={() => removeValueFromVariant(index, vIndex)}
                                        size="sm"
                                        variant="flat"
                                    >
                                        {val}
                                    </Chip>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder={`Thêm ${variant.name}`}
                                    size="sm"
                                    value={activeVariantIndex === index ? newVariantValue : ""}
                                    onValueChange={(val) => {
                                        setActiveVariantIndex(index);
                                        setNewVariantValue(val);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            addValueToVariant(index);
                                        }
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
                    <p className="text-tiny text-default-400 text-center">Chưa có tùy chọn nào.</p>
                )}
            </div>

            {/* Stock Management Section */}
            {combinations.length > 0 && onStockChange && (
                <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Package size={16} className="text-default-500" />
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
                                <div key={combo} className="flex items-center gap-2 p-2 bg-default-50 rounded-md">
                                    <span className="text-sm flex-1 truncate" title={displayName}>
                                        {displayName}
                                    </span>
                                    <Input
                                        type="number"
                                        size="sm"
                                        className="w-24"
                                        value={stock.toString()}
                                        onValueChange={(val) => {
                                            const num = parseInt(val) || 0;
                                            updateVariantStock(combo, num);
                                        }}
                                        min={0}
                                        endContent={
                                            <span className="text-tiny text-default-400">sp</span>
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-tiny text-default-400 mt-2">
                        Tổng: {Object.values(variantStock).reduce((sum, s) => sum + s, 0)} sản phẩm
                    </p>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button, Input, Chip } from "@heroui/react";
import { Plus, X } from "lucide-react";

interface VariantOption {
    name: string;
    values: string[];
}

interface VariantBuilderProps {
    value: string;
    onChange: (value: string) => void;
}

export default function VariantBuilder({ value, onChange }: VariantBuilderProps) {
    const [variants, setVariants] = useState<VariantOption[]>([]);
    const [newVariantName, setNewVariantName] = useState("");
    const [newVariantValue, setNewVariantValue] = useState("");
    const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);

    useEffect(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value);
                // Convert object { "Size": ["S", "M"], "Color": ["Red"] } to array format
                const variantArray = Object.entries(parsed).map(([name, values]) => ({
                    name,
                    values: Array.isArray(values) ? values : [],
                }));
                setVariants(variantArray);
            } else {
                setVariants([]);
            }
        } catch (e) {
            // If invalid JSON, ignore or handle gracefully
            console.error("Invalid variant JSON", e);
        }
    }, []);

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
    };

    const addValueToVariant = (index: number) => {
        if (!newVariantValue.trim()) return;
        const newVariants = [...variants];
        if (!newVariants[index].values.includes(newVariantValue)) {
            newVariants[index].values.push(newVariantValue);
            setVariants(newVariants);
            updateParent(newVariants);
        }
        setNewVariantValue("");
    };

    const removeValueFromVariant = (variantIndex: number, valueIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values = newVariants[variantIndex].values.filter((_, i) => i !== valueIndex);
        setVariants(newVariants);
        updateParent(newVariants);
    };

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg border-default-200">
            <div className="flex gap-2 items-end">
                <Input
                    label="Variant Name (e.g. Size, Color)"
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
                                placeholder={`Add ${variant.name} option`}
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
                                Add
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {variants.length === 0 && (
                <p className="text-tiny text-default-400 text-center">No variants added yet.</p>
            )}
        </div>
    );
}

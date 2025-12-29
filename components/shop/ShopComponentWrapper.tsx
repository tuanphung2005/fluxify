"use client";

import { Suspense } from "react";
import { ComponentType } from "@prisma/client";
import { ComponentConfig } from "@/types/shop";
import { COMPONENT_REGISTRY } from "@/lib/registry/component-registry";
import { Spinner } from "@heroui/spinner";

interface ShopComponentWrapperProps {
    type: ComponentType;
    config: ComponentConfig;
    isBuilder?: boolean;
    onSelect?: () => void;
    isSelected?: boolean;
    products?: Array<{
        id: string;
        name: string;
        price: number;
        images: string[];
    }>;
    vendorId?: string;
}

/**
 * Universal wrapper for rendering shop components
 * Uses the component registry for dynamic component loading
 */
export default function ShopComponentWrapper({
    type,
    config,
    isBuilder = false,
    onSelect,
    isSelected = false,
    products,
    vendorId,
}: ShopComponentWrapperProps) {
    const meta = COMPONENT_REGISTRY[type];

    if (!meta) {
        return (
            <div className="p-4 text-center text-default-500">
                Unknown component type: {type}
            </div>
        );
    }

    const { Component, label, colors } = meta;

    const handleClick = () => {
        if (isBuilder && onSelect) {
            onSelect();
        }
    };

    const wrapperClasses = isBuilder
        ? `relative border-2 transition-all cursor-pointer ${isSelected
            ? "border-primary ring-2 ring-primary ring-offset-2"
            : `hover:border-primary/50 ${colors.border} ${colors.bg}`
        }`
        : "";

    return (
        <div className={wrapperClasses} onClick={handleClick}>
            {isBuilder && (
                <div
                    className={`absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold lowercase tracking-wider z-10 ${colors.badge}`}
                >
                    {label}
                </div>
            )}
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[100px]">
                        <Spinner size="sm" />
                    </div>
                }
            >
                <Component
                    config={config}
                    products={products}
                    vendorId={vendorId}
                />
            </Suspense>
        </div>
    );
}

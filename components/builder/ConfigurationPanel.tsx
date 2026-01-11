"use client";

import { Suspense, useState, useEffect } from "react";
import { ComponentType } from "@prisma/client";
import { ComponentConfig } from "@/types/shop";
import { COMPONENT_REGISTRY } from "@/lib/registry/component-registry";
import { Spinner } from "@heroui/spinner";

interface ConfigurationPanelProps {
    componentType: ComponentType | null;
    config: ComponentConfig | null;
    onUpdateConfig: (newConfig: ComponentConfig) => void;
}

/**
 * Configuration panel for editing shop component properties
 * Uses the component registry for dynamic config panel loading
 */
export default function ConfigurationPanel({
    componentType,
    config,
    onUpdateConfig,
}: ConfigurationPanelProps) {
    const [localConfig, setLocalConfig] = useState<ComponentConfig | null>(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config, componentType]);

    const updateField = (
        field: string | number | symbol | Partial<ComponentConfig>,
        value?: unknown
    ) => {
        let newConfig: ComponentConfig;

        if (typeof field === "object" && field !== null) {
            // Handle partial update
            newConfig = { ...(localConfig || {}), ...field } as ComponentConfig;
        } else {
            // Handle single field update
            newConfig = { ...(localConfig || {}), [field as string]: value };
        }

        setLocalConfig(newConfig);
        onUpdateConfig(newConfig);
    };

    if (!componentType || !localConfig) {
        return (
            <div className="w-80 bg-content1 border-l border-divider p-4">
                <h3 className="text-lg font-bold mb-4">cấu hình</h3>
                <p className="text-sm text-default-500">
                    chọn một thành phần để cấu hình
                </p>
            </div>
        );
    }

    const meta = COMPONENT_REGISTRY[componentType];

    if (!meta) {
        return (
            <div className="w-80 bg-content1 border-l border-divider p-4">
                <h3 className="text-lg font-bold mb-4">cấu hình</h3>
                <p className="text-sm text-default-500">
                    Loại thành phần không xác định: {componentType}
                </p>
            </div>
        );
    }

    const { ConfigPanel } = meta;

    return (
        <div className="w-80 bg-content1 border-l border-divider p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">cấu hình</h3>
            <div className="space-y-4">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-8">
                            <Spinner size="sm" />
                        </div>
                    }
                >
                    <ConfigPanel config={localConfig} onUpdate={updateField} />
                </Suspense>
            </div>
        </div>
    );
}

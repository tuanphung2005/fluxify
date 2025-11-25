"use client";

import { ComponentType } from "@prisma/client";
import { ComponentConfig } from "@/types/shop";
import { useState, useEffect } from "react";
import HeroConfig from "./config/Hero";
import ProductGridConfig from "./config/ProductGrid";
import ImageGalleryConfig from "./config/ImageGallery";
import VideoEmbedConfig from "./config/VideoEmbed";
import TextBlockConfig from "./config/TextBlock";
import SpacerConfig from "./config/Spacer";

interface ConfigurationPanelProps {
    componentType: ComponentType | null;
    config: ComponentConfig | null;
    onUpdateConfig: (newConfig: ComponentConfig) => void;
}

export default function ConfigurationPanel({
    componentType,
    config,
    onUpdateConfig,
}: ConfigurationPanelProps) {
    const [localConfig, setLocalConfig] = useState<ComponentConfig | null>(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config, componentType]);

    const updateField = (field: string | number | symbol, value: any) => {
        const newConfig = { ...(localConfig || {}), [field]: value };
        setLocalConfig(newConfig);
        onUpdateConfig(newConfig);
    };

    if (!componentType || !localConfig) {
        return (
            <div className="w-80 bg-content1 border-l border-divider p-4">
                <h3 className="text-lg font-bold mb-4">configuration</h3>
                <p className="text-sm text-default-500">
                    select a component to configure
                </p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-content1 border-l border-divider p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">configuration</h3>
            <div className="space-y-4">
                {componentType === "HERO" && (
                    <HeroConfig config={localConfig as any} onUpdate={updateField} />
                )}

                {componentType === "PRODUCT_GRID" && (
                    <ProductGridConfig
                        config={localConfig as any}
                        onUpdate={updateField}
                    />
                )}

                {componentType === "IMAGE_GALLERY" && (
                    <ImageGalleryConfig
                        config={localConfig as any}
                        onUpdate={updateField}
                    />
                )}

                {componentType === "VIDEO_EMBED" && (
                    <VideoEmbedConfig
                        config={localConfig as any}
                        onUpdate={updateField}
                    />
                )}

                {componentType === "TEXT_BLOCK" && (
                    <TextBlockConfig
                        config={localConfig as any}
                        onUpdate={updateField}
                    />
                )}

                {componentType === "SPACER" && (
                    <SpacerConfig config={localConfig as any} onUpdate={updateField} />
                )}
            </div>
        </div>
    );
}

"use client";

import { ComponentType } from "@prisma/client";
import {
    ComponentConfig,
    HeroConfig,
    ProductGridConfig,
    ImageGalleryConfig,
    VideoEmbedConfig,
    TextBlockConfig,
    SpacerConfig
} from "@/types/shop";
import HeroComponent from "./components/Hero";
import ProductGridComponent from "./components/ProductGrid";
import ImageGalleryComponent from "./components/ImageGallery";
import VideoEmbedComponent from "./components/VideoEmbedt";
import TextBlockComponent from "./components/TextBlock";
import SpacerComponent from "./components/Spacer";

interface ShopComponentWrapperProps {
    type: ComponentType;
    config: ComponentConfig;
    isBuilder?: boolean;
    onSelect?: () => void;
    isSelected?: boolean;
}

export default function ShopComponentWrapper({
    type,
    config,
    isBuilder = false,
    onSelect,
    isSelected = false,
}: ShopComponentWrapperProps) {
    const handleClick = () => {
        if (isBuilder && onSelect) {
            onSelect();
        }
    };

    const wrapperClasses = isBuilder
        ? `cursor-pointer transition-all ${isSelected
            ? "ring-2 ring-primary ring-offset-2"
            : "hover:ring-2 hover:ring-default-300"
        }`
        : "";

    return (
        <div className={wrapperClasses} onClick={handleClick}>
            {type === "HERO" && <HeroComponent config={config as HeroConfig} />}
            {type === "PRODUCT_GRID" && <ProductGridComponent config={config as ProductGridConfig} />}
            {type === "IMAGE_GALLERY" && <ImageGalleryComponent config={config as ImageGalleryConfig} />}
            {type === "VIDEO_EMBED" && <VideoEmbedComponent config={config as VideoEmbedConfig} />}
            {type === "TEXT_BLOCK" && <TextBlockComponent config={config as TextBlockConfig} />}
            {type === "SPACER" && <SpacerComponent config={config as SpacerConfig} />}
        </div>
    );
}

import { ComponentType } from "@prisma/client";
import {
    HeroConfig,
    ProductGridConfig,
    ImageGalleryConfig,
    VideoEmbedConfig,
    TextBlockConfig,
    SpacerConfig,
} from "@/types/shop";

export const DEFAULT_CONFIGS: Record<ComponentType, any> = {
    HERO: {
        title: "Welcome to Our Shop",
        subtitle: "Discover amazing products",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
        ctaText: "Shop Now",
        ctaLink: "#",
        backgroundColor: "#000000",
        textColor: "#FFFFFF",
    } as HeroConfig,

    PRODUCT_GRID: {
        title: "Featured Products",
        columns: 3,
        showAddToCart: true,
        showAllProducts: true,
    } as ProductGridConfig,

    IMAGE_GALLERY: {
        images: [
            {
                url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
                alt: "Gallery image 1",
            },
            {
                url: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
                alt: "Gallery image 2",
            },
        ],
        columns: 3,
        aspectRatio: "landscape",
    } as ImageGalleryConfig,

    VIDEO_EMBED: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Featured Video",
        aspectRatio: "16:9",
        autoplay: false,
        loop: false,
    } as VideoEmbedConfig,

    TEXT_BLOCK: {
        content: "<p>Add your custom text here...</p>",
        alignment: "left",
        padding: "medium",
    } as TextBlockConfig,

    SPACER: {
        height: 50,
    } as SpacerConfig,
};

/**
 * Get the default configuration for a component type
 */
export function getDefaultConfig(type: ComponentType) {
    return DEFAULT_CONFIGS[type] || {};
}

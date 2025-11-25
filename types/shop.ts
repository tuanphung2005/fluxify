import { ComponentType } from "@prisma/client";

// Component configuration types for each component
export interface HeroConfig {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundColor?: string;
    textColor?: string;
}

export interface ProductGridConfig {
    title?: string;
    productIds?: string[];
    showAllProducts?: boolean;
    columns?: number;
    showAddToCart?: boolean;
}

export interface ImageGalleryConfig {
    images: Array<{
        url: string;
        alt: string;
        caption?: string;
    }>;
    columns?: number;
    aspectRatio?: "square" | "landscape" | "portrait";
}

export interface VideoEmbedConfig {
    videoUrl: string; // YouTube, Vimeo, or direct URL
    title?: string;
    autoplay?: boolean;
    loop?: boolean;
    aspectRatio?: "16:9" | "4:3" | "1:1";
}

export interface TextBlockConfig {
    content: string; // HTML content
    alignment?: "left" | "center" | "right";
    backgroundColor?: string;
    textColor?: string;
    padding?: "small" | "medium" | "large";
}

export interface SpacerConfig {
    height: number; // in pixels
}

// Union type for all component configs
export type ComponentConfig =
    | HeroConfig
    | ProductGridConfig
    | ImageGalleryConfig
    | VideoEmbedConfig
    | TextBlockConfig
    | SpacerConfig;

// Shop component instance from database
export interface ShopComponentData {
    id: string;
    templateId: string;
    type: ComponentType;
    order: number;
    config: ComponentConfig;
    createdAt: Date;
    updatedAt: Date;
}

// Shop template from database
export interface ShopTemplateData {
    id: string;
    vendorId: string;
    name: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    components: ShopComponentData[];
}

// Builder state management
export interface BuilderState {
    template: ShopTemplateData | null;
    selectedComponentId: string | null;
    isDirty: boolean;
    isSaving: boolean;
}

// Component palette item
export interface ComponentPaletteItem {
    type: ComponentType;
    label: string;
    icon: string;
    description: string;
    defaultConfig: ComponentConfig;
}

// Drag and drop types
export interface DragItem {
    type: "NEW_COMPONENT" | "EXISTING_COMPONENT";
    componentType?: ComponentType;
    componentId?: string;
}

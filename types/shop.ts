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

// New component configs for Phase 4
export interface TestimonialsConfig {
    title?: string;
    testimonials: Array<{
        name: string;
        avatar?: string;
        rating: number;
        comment: string;
        role?: string;
    }>;
    layout?: "grid" | "carousel";
    backgroundColor?: string;
}

export interface FeaturedCollectionConfig {
    title: string;
    description?: string;
    productIds: string[];
    layout?: "grid" | "list" | "carousel";
    columns?: number;
    showAddToCart?: boolean;
}

export interface CountdownTimerConfig {
    title: string;
    endDate: string; // ISO date string
    subtitle?: string;
    expiredMessage?: string;
    backgroundColor?: string;
    textColor?: string;
}

export interface NewsletterSignupConfig {
    title: string;
    subtitle?: string;
    buttonText?: string;
    placeholder?: string;
    backgroundColor?: string;
    textColor?: string;
}

export interface FaqAccordionConfig {
    title?: string;
    items: Array<{
        question: string;
        answer: string;
    }>;
    backgroundColor?: string;
}

export interface BannerCarouselConfig {
    banners: Array<{
        imageUrl: string;
        title?: string;
        subtitle?: string;
        ctaText?: string;
        ctaLink?: string;
    }>;
    autoplay?: boolean;
    interval?: number; // milliseconds
    showDots?: boolean;
    showArrows?: boolean;
}

// Union type for all component configs
export type ComponentConfig =
    | HeroConfig
    | ProductGridConfig
    | ImageGalleryConfig
    | VideoEmbedConfig
    | TextBlockConfig
    | SpacerConfig
    | TestimonialsConfig
    | FeaturedCollectionConfig
    | CountdownTimerConfig
    | NewsletterSignupConfig
    | FaqAccordionConfig
    | BannerCarouselConfig;

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
    vendor?: {
        storeName: string;
        favicon: string | null;
    };
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

import { ComponentType } from "@prisma/client";
import { lazy } from "react";
import { ComponentConfig } from "@/types/shop";
import { COMPONENT_LABELS, COMPONENT_COLORS, COMPONENT_ICONS, ComponentColors } from "@/lib/ui/tokens";
import { DEFAULT_CONFIGS } from "@/lib/shop/default-configs";
import { LucideIcon } from "lucide-react";

// =============================================================================
// COMPONENT REGISTRY TYPES
// =============================================================================

// Using React.ComponentType<any> for lazy-loaded components since they accept
// different props based on the component type. Type safety is maintained at
// the usage site through the registry lookup pattern.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LazyComponent = React.LazyExoticComponent<React.ComponentType<any>>;

export interface ComponentMeta {
    type: ComponentType;
    label: string;
    description: string;
    icon: LucideIcon;
    colors: ComponentColors;
    defaultConfig: ComponentConfig;
    Component: LazyComponent;
    ConfigPanel: LazyComponent;
}

// =============================================================================
// COMPONENT DESCRIPTIONS
// =============================================================================

const COMPONENT_DESCRIPTIONS: Record<ComponentType, string> = {
    HERO: "Full-width hero banner with title, subtitle, and call-to-action",
    PRODUCT_GRID: "Display products in a customizable grid layout",
    IMAGE_GALLERY: "Showcase images in a gallery format",
    VIDEO_EMBED: "Embed YouTube, Vimeo, or custom videos",
    TEXT_BLOCK: "Rich text content with customizable styling",
    SPACER: "Add vertical spacing between components",
    TESTIMONIALS: "Display customer reviews and testimonials",
    FEATURED_COLLECTION: "Highlight a curated collection of products",
    COUNTDOWN_TIMER: "Create urgency with countdown timers",
    NEWSLETTER_SIGNUP: "Collect email subscriptions",
    FAQ_ACCORDION: "Expandable FAQ sections",
    BANNER_CAROUSEL: "Rotating banners with auto-play support",
};

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================

/**
 * Central registry for all shop builder components
 * Provides lazy-loaded components, configs, and metadata
 */
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentMeta> = {
    HERO: {
        type: "HERO",
        label: COMPONENT_LABELS.HERO,
        description: COMPONENT_DESCRIPTIONS.HERO,
        icon: COMPONENT_ICONS.HERO,
        colors: COMPONENT_COLORS.HERO,
        defaultConfig: DEFAULT_CONFIGS.HERO,
        Component: lazy(() => import("@/components/shop/components/Hero")),
        ConfigPanel: lazy(() => import("@/components/builder/config/Hero")),
    },
    PRODUCT_GRID: {
        type: "PRODUCT_GRID",
        label: COMPONENT_LABELS.PRODUCT_GRID,
        description: COMPONENT_DESCRIPTIONS.PRODUCT_GRID,
        icon: COMPONENT_ICONS.PRODUCT_GRID,
        colors: COMPONENT_COLORS.PRODUCT_GRID,
        defaultConfig: DEFAULT_CONFIGS.PRODUCT_GRID,
        Component: lazy(() => import("@/components/shop/components/ProductGrid")),
        ConfigPanel: lazy(() => import("@/components/builder/config/ProductGrid")),
    },
    IMAGE_GALLERY: {
        type: "IMAGE_GALLERY",
        label: COMPONENT_LABELS.IMAGE_GALLERY,
        description: COMPONENT_DESCRIPTIONS.IMAGE_GALLERY,
        icon: COMPONENT_ICONS.IMAGE_GALLERY,
        colors: COMPONENT_COLORS.IMAGE_GALLERY,
        defaultConfig: DEFAULT_CONFIGS.IMAGE_GALLERY,
        Component: lazy(() => import("@/components/shop/components/ImageGallery")),
        ConfigPanel: lazy(() => import("@/components/builder/config/ImageGallery")),
    },
    VIDEO_EMBED: {
        type: "VIDEO_EMBED",
        label: COMPONENT_LABELS.VIDEO_EMBED,
        description: COMPONENT_DESCRIPTIONS.VIDEO_EMBED,
        icon: COMPONENT_ICONS.VIDEO_EMBED,
        colors: COMPONENT_COLORS.VIDEO_EMBED,
        defaultConfig: DEFAULT_CONFIGS.VIDEO_EMBED,
        Component: lazy(() => import("@/components/shop/components/VideoEmbedt")),
        ConfigPanel: lazy(() => import("@/components/builder/config/VideoEmbed")),
    },
    TEXT_BLOCK: {
        type: "TEXT_BLOCK",
        label: COMPONENT_LABELS.TEXT_BLOCK,
        description: COMPONENT_DESCRIPTIONS.TEXT_BLOCK,
        icon: COMPONENT_ICONS.TEXT_BLOCK,
        colors: COMPONENT_COLORS.TEXT_BLOCK,
        defaultConfig: DEFAULT_CONFIGS.TEXT_BLOCK,
        Component: lazy(() => import("@/components/shop/components/TextBlock")),
        ConfigPanel: lazy(() => import("@/components/builder/config/TextBlock")),
    },
    SPACER: {
        type: "SPACER",
        label: COMPONENT_LABELS.SPACER,
        description: COMPONENT_DESCRIPTIONS.SPACER,
        icon: COMPONENT_ICONS.SPACER,
        colors: COMPONENT_COLORS.SPACER,
        defaultConfig: DEFAULT_CONFIGS.SPACER,
        Component: lazy(() => import("@/components/shop/components/Spacer")),
        ConfigPanel: lazy(() => import("@/components/builder/config/Spacer")),
    },
    TESTIMONIALS: {
        type: "TESTIMONIALS",
        label: COMPONENT_LABELS.TESTIMONIALS,
        description: COMPONENT_DESCRIPTIONS.TESTIMONIALS,
        icon: COMPONENT_ICONS.TESTIMONIALS,
        colors: COMPONENT_COLORS.TESTIMONIALS,
        defaultConfig: DEFAULT_CONFIGS.TESTIMONIALS,
        Component: lazy(() => import("@/components/shop/components/TestimonialsComponent")),
        ConfigPanel: lazy(() => import("@/components/builder/config/TestimonialsConfig")),
    },
    FEATURED_COLLECTION: {
        type: "FEATURED_COLLECTION",
        label: COMPONENT_LABELS.FEATURED_COLLECTION,
        description: COMPONENT_DESCRIPTIONS.FEATURED_COLLECTION,
        icon: COMPONENT_ICONS.FEATURED_COLLECTION,
        colors: COMPONENT_COLORS.FEATURED_COLLECTION,
        defaultConfig: DEFAULT_CONFIGS.FEATURED_COLLECTION,
        Component: lazy(() => import("@/components/shop/components/FeaturedCollectionComponent")),
        ConfigPanel: lazy(() => import("@/components/builder/config/FeaturedCollectionConfig")),
    },
    COUNTDOWN_TIMER: {
        type: "COUNTDOWN_TIMER",
        label: COMPONENT_LABELS.COUNTDOWN_TIMER,
        description: COMPONENT_DESCRIPTIONS.COUNTDOWN_TIMER,
        icon: COMPONENT_ICONS.COUNTDOWN_TIMER,
        colors: COMPONENT_COLORS.COUNTDOWN_TIMER,
        defaultConfig: DEFAULT_CONFIGS.COUNTDOWN_TIMER,
        Component: lazy(() => import("@/components/shop/components/CountdownTimerComponent")),
        ConfigPanel: lazy(() => import("@/components/builder/config/CountdownTimerConfig")),
    },
    NEWSLETTER_SIGNUP: {
        type: "NEWSLETTER_SIGNUP",
        label: COMPONENT_LABELS.NEWSLETTER_SIGNUP,
        description: COMPONENT_DESCRIPTIONS.NEWSLETTER_SIGNUP,
        icon: COMPONENT_ICONS.NEWSLETTER_SIGNUP,
        colors: COMPONENT_COLORS.NEWSLETTER_SIGNUP,
        defaultConfig: DEFAULT_CONFIGS.NEWSLETTER_SIGNUP,
        Component: lazy(() => import("@/components/shop/components/NewsletterSignupComponent")),
        ConfigPanel: lazy(() => import("@/components/builder/config/NewsletterSignupConfig")),
    },
    FAQ_ACCORDION: {
        type: "FAQ_ACCORDION",
        label: COMPONENT_LABELS.FAQ_ACCORDION,
        description: COMPONENT_DESCRIPTIONS.FAQ_ACCORDION,
        icon: COMPONENT_ICONS.FAQ_ACCORDION,
        colors: COMPONENT_COLORS.FAQ_ACCORDION,
        defaultConfig: DEFAULT_CONFIGS.FAQ_ACCORDION,
        Component: lazy(() => import("@/components/shop/components/FaqAccordionComponent")),
        ConfigPanel: lazy(() => import("@/components/builder/config/FaqAccordionConfig")),
    },
    BANNER_CAROUSEL: {
        type: "BANNER_CAROUSEL",
        label: COMPONENT_LABELS.BANNER_CAROUSEL,
        description: COMPONENT_DESCRIPTIONS.BANNER_CAROUSEL,
        icon: COMPONENT_ICONS.BANNER_CAROUSEL,
        colors: COMPONENT_COLORS.BANNER_CAROUSEL,
        defaultConfig: DEFAULT_CONFIGS.BANNER_CAROUSEL,
        Component: lazy(() => import("@/components/shop/components/BannerCarouselComponent")),
        ConfigPanel: lazy(() => import("@/components/builder/config/BannerCarouselConfig")),
    },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get component metadata by type
 */
export function getComponentMeta(type: ComponentType): ComponentMeta | undefined {
    return COMPONENT_REGISTRY[type];
}

/**
 * Get default config for a component type
 */
export function getDefaultConfig(type: ComponentType): ComponentConfig {
    return DEFAULT_CONFIGS[type];
}

/**
 * Get all component types as an array for iteration
 */
export function getAllComponentTypes(): ComponentType[] {
    return Object.keys(COMPONENT_REGISTRY) as ComponentType[];
}

/**
 * Get component palette items for the builder
 */
export function getComponentPaletteItems() {
    return getAllComponentTypes().map((type) => {
        const meta = COMPONENT_REGISTRY[type];
        return {
            type,
            label: meta.label,
            icon: meta.icon,
            description: meta.description,
            defaultConfig: meta.defaultConfig,
        };
    });
}

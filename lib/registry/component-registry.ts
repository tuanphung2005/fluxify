import { ComponentType } from "@prisma/client";
import { lazy } from "react";
import { LucideIcon } from "lucide-react";

import { ComponentConfig } from "@/types/shop";
import {
  COMPONENT_LABELS,
  COMPONENT_COLORS,
  COMPONENT_ICONS,
  ComponentColors,
} from "@/lib/ui/tokens";
import { DEFAULT_CONFIGS } from "@/lib/shop/default-configs";

// =============================================================================
// COMPONENT REGISTRY TYPES
// =============================================================================

// Using React.ComponentType<any> for lazy-loaded components since they accept
// different props based on the component type. Type safety is maintained at
// the usage site through the registry lookup pattern.

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

const COMPONENT_DESCRIPTIONS: Record<Exclude<ComponentType, "SPACER">, string> = {
  HERO: "Banner toàn chiều rộng với tiêu đề, phụ đề và nút kêu gọi hành động",
  IMAGE_GALLERY: "Trưng bày hình ảnh theo dạng thư viện",
  VIDEO_EMBED: "Nhúng video từ YouTube, Vimeo hoặc tùy chỉnh",
  TEXT_BLOCK: "Nội dung văn bản phong phú với kiểu dáng tùy chỉnh",

  TESTIMONIALS: "Hiển thị đánh giá và nhận xét của khách hàng",
  FEATURED_COLLECTION: "Nổi bật bộ sưu tập sản phẩm được chọn lọc",
  COUNTDOWN_TIMER: "Tạo sự khẩn cấp với đồng hồ đếm ngược",
  NEWSLETTER_SIGNUP: "Thu thập đăng ký email",
  FAQ_ACCORDION: "Danh mục câu hỏi thường gặp có thể mở rộng",
  BANNER_CAROUSEL: "Banner xoay vòng với chế độ tự động",
  MAP_LOCATION: "Hiển thị bản đồ vị trí cửa hàng với Google Maps",
};

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================

/**
 * Central registry for all shop builder components
 * Provides lazy-loaded components, configs, and metadata
 */
export const COMPONENT_REGISTRY: Record<
  Exclude<ComponentType, "SPACER">,
  ComponentMeta
> = {
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

  TESTIMONIALS: {
    type: "TESTIMONIALS",
    label: COMPONENT_LABELS.TESTIMONIALS,
    description: COMPONENT_DESCRIPTIONS.TESTIMONIALS,
    icon: COMPONENT_ICONS.TESTIMONIALS,
    colors: COMPONENT_COLORS.TESTIMONIALS,
    defaultConfig: DEFAULT_CONFIGS.TESTIMONIALS,
    Component: lazy(
      () => import("@/components/shop/components/TestimonialsComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/TestimonialsConfig"),
    ),
  },
  FEATURED_COLLECTION: {
    type: "FEATURED_COLLECTION",
    label: COMPONENT_LABELS.FEATURED_COLLECTION,
    description: COMPONENT_DESCRIPTIONS.FEATURED_COLLECTION,
    icon: COMPONENT_ICONS.FEATURED_COLLECTION,
    colors: COMPONENT_COLORS.FEATURED_COLLECTION,
    defaultConfig: DEFAULT_CONFIGS.FEATURED_COLLECTION,
    Component: lazy(
      () => import("@/components/shop/components/FeaturedCollectionComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/FeaturedCollectionConfig"),
    ),
  },
  COUNTDOWN_TIMER: {
    type: "COUNTDOWN_TIMER",
    label: COMPONENT_LABELS.COUNTDOWN_TIMER,
    description: COMPONENT_DESCRIPTIONS.COUNTDOWN_TIMER,
    icon: COMPONENT_ICONS.COUNTDOWN_TIMER,
    colors: COMPONENT_COLORS.COUNTDOWN_TIMER,
    defaultConfig: DEFAULT_CONFIGS.COUNTDOWN_TIMER,
    Component: lazy(
      () => import("@/components/shop/components/CountdownTimerComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/CountdownTimerConfig"),
    ),
  },
  NEWSLETTER_SIGNUP: {
    type: "NEWSLETTER_SIGNUP",
    label: COMPONENT_LABELS.NEWSLETTER_SIGNUP,
    description: COMPONENT_DESCRIPTIONS.NEWSLETTER_SIGNUP,
    icon: COMPONENT_ICONS.NEWSLETTER_SIGNUP,
    colors: COMPONENT_COLORS.NEWSLETTER_SIGNUP,
    defaultConfig: DEFAULT_CONFIGS.NEWSLETTER_SIGNUP,
    Component: lazy(
      () => import("@/components/shop/components/NewsletterSignupComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/NewsletterSignupConfig"),
    ),
  },
  FAQ_ACCORDION: {
    type: "FAQ_ACCORDION",
    label: COMPONENT_LABELS.FAQ_ACCORDION,
    description: COMPONENT_DESCRIPTIONS.FAQ_ACCORDION,
    icon: COMPONENT_ICONS.FAQ_ACCORDION,
    colors: COMPONENT_COLORS.FAQ_ACCORDION,
    defaultConfig: DEFAULT_CONFIGS.FAQ_ACCORDION,
    Component: lazy(
      () => import("@/components/shop/components/FaqAccordionComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/FaqAccordionConfig"),
    ),
  },
  BANNER_CAROUSEL: {
    type: "BANNER_CAROUSEL",
    label: COMPONENT_LABELS.BANNER_CAROUSEL,
    description: COMPONENT_DESCRIPTIONS.BANNER_CAROUSEL,
    icon: COMPONENT_ICONS.BANNER_CAROUSEL,
    colors: COMPONENT_COLORS.BANNER_CAROUSEL,
    defaultConfig: DEFAULT_CONFIGS.BANNER_CAROUSEL,
    Component: lazy(
      () => import("@/components/shop/components/BannerCarouselComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/BannerCarouselConfig"),
    ),
  },
  MAP_LOCATION: {
    type: "MAP_LOCATION",
    label: COMPONENT_LABELS.MAP_LOCATION,
    description: COMPONENT_DESCRIPTIONS.MAP_LOCATION,
    icon: COMPONENT_ICONS.MAP_LOCATION,
    colors: COMPONENT_COLORS.MAP_LOCATION,
    defaultConfig: DEFAULT_CONFIGS.MAP_LOCATION,
    Component: lazy(
      () => import("@/components/shop/components/MapLocationComponent"),
    ),
    ConfigPanel: lazy(
      () => import("@/components/builder/config/MapLocationConfig"),
    ),
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get component metadata by type
 */
export function getComponentMeta(
  type: ComponentType,
): ComponentMeta | undefined {
  // @ts-ignore - Validated by runtime check or we accept undefined for excluded types
  return COMPONENT_REGISTRY[type as keyof typeof COMPONENT_REGISTRY];
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
export function getAllComponentTypes(): Exclude<ComponentType, "SPACER">[] {
  return Object.keys(COMPONENT_REGISTRY) as Exclude<ComponentType, "SPACER">[];
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

import { ComponentType } from "@prisma/client";
import {
  LucideIcon,
  Image,
  Grid3X3,
  ImageIcon,
  Video,
  FileText,
  Minus,
  MessageSquareQuote,
  Star,
  Timer,
  Mail,
  HelpCircle,
  Images,
  MapPin,
} from "lucide-react";

/**
 * Design tokens for consistent UI styling across the application
 */

// =============================================================================
// COMPONENT COLOR MAPPINGS
// =============================================================================

export interface ComponentColors {
  border: string;
  bg: string;
  badge: string;
}

export const COMPONENT_COLORS: Record<ComponentType, ComponentColors> = {
  HERO: {
    border: "border-primary-500/50",
    bg: "bg-primary-50/10",
    badge: "bg-primary-500 text-white",
  },
  IMAGE_GALLERY: {
    border: "border-success-500/50",
    bg: "bg-success-50/10",
    badge: "bg-success-500 text-white",
  },
  VIDEO_EMBED: {
    border: "border-warning-500/50",
    bg: "bg-warning-50/10",
    badge: "bg-warning-500 text-white",
  },
  TEXT_BLOCK: {
    border: "border-danger-500/50",
    bg: "bg-danger-50/10",
    badge: "bg-danger-500 text-white",
  },

  FEATURED_COLLECTION: {
    border: "border-purple-500/50",
    bg: "bg-purple-50/10",
    badge: "bg-purple-500 text-white",
  },
  COUNTDOWN_TIMER: {
    border: "border-orange-500/50",
    bg: "bg-orange-50/10",
    badge: "bg-orange-500 text-white",
  },

  FAQ_ACCORDION: {
    border: "border-teal-500/50",
    bg: "bg-teal-50/10",
    badge: "bg-teal-500 text-white",
  },
  BANNER_CAROUSEL: {
    border: "border-indigo-500/50",
    bg: "bg-indigo-50/10",
    badge: "bg-indigo-500 text-white",
  },
  MAP_LOCATION: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-50/10",
    badge: "bg-emerald-500 text-white",
  },
};

// =============================================================================
// COMPONENT LABELS
// =============================================================================

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  HERO: "banner chính",
  IMAGE_GALLERY: "thư viện ảnh",
  VIDEO_EMBED: "video nhúng",
  TEXT_BLOCK: "khối văn bản",

  FEATURED_COLLECTION: "bộ sưu tập nổi bật",
  COUNTDOWN_TIMER: "đếm ngược",

  FAQ_ACCORDION: "câu hỏi thường gặp",
  BANNER_CAROUSEL: "băng chảy banner",
  MAP_LOCATION: "bản đồ vị trí",
};

// =============================================================================
// COMPONENT ICONS
// =============================================================================

export const COMPONENT_ICONS: Record<ComponentType, LucideIcon> = {
  HERO: Image,
  IMAGE_GALLERY: ImageIcon,
  VIDEO_EMBED: Video,
  TEXT_BLOCK: FileText,

  FEATURED_COLLECTION: Star,
  COUNTDOWN_TIMER: Timer,

  FAQ_ACCORDION: HelpCircle,
  BANNER_CAROUSEL: Images,
  MAP_LOCATION: MapPin,
};

// =============================================================================
// BENTO GRID SIZING
// =============================================================================

export type BentoSize = "sm" | "md" | "lg" | "xl" | "full";

export const BENTO_SIZES: Record<BentoSize, string> = {
  sm: "col-span-1 row-span-1",
  md: "col-span-1 row-span-2",
  lg: "col-span-2 row-span-1",
  xl: "col-span-2 row-span-2",
  full: "col-span-full row-span-1",
};

// =============================================================================
// GRID CONFIGURATIONS
// =============================================================================

export type GridColumns = 2 | 3 | 4;

export const GRID_COLUMNS: Record<GridColumns, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

// =============================================================================
// GAP SIZING
// =============================================================================

export type GapSize = "sm" | "md" | "lg";

export const GAP_SIZES: Record<GapSize, string> = {
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-8",
};

// =============================================================================
// STATS CARD COLORS
// =============================================================================

export type StatsColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "default";

export const STATS_COLORS: Record<StatsColor, string> = {
  primary: "text-primary bg-primary/10",
  secondary: "text-secondary bg-secondary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10",
  default: "text-default-500 bg-default-100",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getComponentColors(type: ComponentType): ComponentColors {
  return (
    COMPONENT_COLORS[type] ?? {
      border: "border-default-300",
      bg: "bg-default-50/10",
      badge: "bg-default-500 text-white",
    }
  );
}

export function getComponentLabel(type: ComponentType): string {
  return COMPONENT_LABELS[type] ?? "component";
}

export function getComponentIcon(type: ComponentType): LucideIcon {
  return COMPONENT_ICONS[type] ?? FileText;
}

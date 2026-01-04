import { z } from "zod";

/**
 * Validation schemas for shop component configurations
 * Each component type has its own schema to validate the config JSON
 */

// Hero component config
export const heroConfigSchema = z.object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(500).optional(),
    backgroundImage: z.string().url().optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    ctaText: z.string().max(50).optional(),
    ctaLink: z.string().max(500).optional(),
    height: z.enum(["small", "medium", "large", "full"]).optional(),
});

// Product grid config
export const productGridConfigSchema = z.object({
    title: z.string().max(200).optional(),
    columns: z.number().int().min(1).max(6).optional(),
    limit: z.number().int().min(1).max(50).optional(),
    categoryId: z.string().optional(),
    showPrice: z.boolean().optional(),
    showRating: z.boolean().optional(),
});

// Image gallery config
export const imageGalleryConfigSchema = z.object({
    images: z.array(z.object({
        url: z.string().url(),
        alt: z.string().max(200).optional(),
        link: z.string().max(500).optional(),
    })).max(20).optional(),
    layout: z.enum(["grid", "masonry", "carousel"]).optional(),
    columns: z.number().int().min(1).max(6).optional(),
});

// Text block config
export const textBlockConfigSchema = z.object({
    content: z.string().max(10000).optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Featured collection config
export const featuredCollectionConfigSchema = z.object({
    title: z.string().max(200).optional(),
    productIds: z.array(z.string()).max(20).optional(),
    layout: z.enum(["grid", "carousel"]).optional(),
});

// Spacer config
export const spacerConfigSchema = z.object({
    height: z.number().int().min(8).max(200).optional(),
});

// Testimonials config
export const testimonialsConfigSchema = z.object({
    testimonials: z.array(z.object({
        name: z.string().max(100),
        role: z.string().max(100).optional(),
        content: z.string().max(1000),
        avatar: z.string().url().optional(),
        rating: z.number().int().min(1).max(5).optional(),
    })).max(10).optional(),
    layout: z.enum(["grid", "carousel"]).optional(),
});

// Countdown timer config
export const countdownTimerConfigSchema = z.object({
    title: z.string().max(200).optional(),
    endDate: z.string().datetime().optional(),
    expiredMessage: z.string().max(200).optional(),
});

// Newsletter signup config
export const newsletterSignupConfigSchema = z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    buttonText: z.string().max(50).optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// FAQ accordion config
export const faqAccordionConfigSchema = z.object({
    title: z.string().max(200).optional(),
    items: z.array(z.object({
        question: z.string().max(500),
        answer: z.string().max(2000),
    })).max(30).optional(),
});

// Banner carousel config
export const bannerCarouselConfigSchema = z.object({
    banners: z.array(z.object({
        image: z.string().url(),
        alt: z.string().max(200).optional(),
        link: z.string().max(500).optional(),
        title: z.string().max(200).optional(),
    })).max(10).optional(),
    autoPlay: z.boolean().optional(),
    interval: z.number().int().min(1000).max(30000).optional(),
});

// Video embed config
export const videoEmbedConfigSchema = z.object({
    url: z.string().url().optional(),
    title: z.string().max(200).optional(),
    autoPlay: z.boolean().optional(),
    aspectRatio: z.enum(["16:9", "4:3", "1:1"]).optional(),
});

// Map component type to its schema
export const componentConfigSchemas: Record<string, z.ZodType> = {
    HERO: heroConfigSchema,
    PRODUCT_GRID: productGridConfigSchema,
    IMAGE_GALLERY: imageGalleryConfigSchema,
    TEXT_BLOCK: textBlockConfigSchema,
    FEATURED_COLLECTION: featuredCollectionConfigSchema,
    SPACER: spacerConfigSchema,
    TESTIMONIALS: testimonialsConfigSchema,
    COUNTDOWN_TIMER: countdownTimerConfigSchema,
    NEWSLETTER_SIGNUP: newsletterSignupConfigSchema,
    FAQ_ACCORDION: faqAccordionConfigSchema,
    BANNER_CAROUSEL: bannerCarouselConfigSchema,
    VIDEO_EMBED: videoEmbedConfigSchema,
};

/**
 * Validate component config based on its type
 */
export function validateComponentConfig(
    type: string,
    config: unknown
): { success: true; data: unknown } | { success: false; error: string } {
    const schema = componentConfigSchemas[type];

    if (!schema) {
        return { success: false, error: `Unknown component type: ${type}` };
    }

    const result = schema.safeParse(config);

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message };
    }

    return { success: true, data: result.data };
}

/**
 * Sanitize component config by validating and stripping unknown properties
 */
export function sanitizeComponentConfig(type: string, config: unknown): unknown {
    const result = validateComponentConfig(type, config);
    return result.success ? result.data : {};
}

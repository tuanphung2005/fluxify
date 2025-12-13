"use client";

import { ComponentType } from "@prisma/client";
import {
    ComponentConfig,
    HeroConfig,
    ProductGridConfig,
    ImageGalleryConfig,
    VideoEmbedConfig,
    TextBlockConfig,
    SpacerConfig,
    TestimonialsConfig,
    FeaturedCollectionConfig,
    CountdownTimerConfig,
    NewsletterSignupConfig,
    FaqAccordionConfig,
    BannerCarouselConfig,
} from "@/types/shop";
import HeroComponent from "./components/Hero";
import ProductGridComponent from "./components/ProductGrid";
import ImageGalleryComponent from "./components/ImageGallery";
import VideoEmbedComponent from "./components/VideoEmbedt";
import TextBlockComponent from "./components/TextBlock";
import SpacerComponent from "./components/Spacer";
import TestimonialsComponent from "./components/TestimonialsComponent";
import FeaturedCollectionComponent from "./components/FeaturedCollectionComponent";
import CountdownTimerComponent from "./components/CountdownTimerComponent";
import NewsletterSignupComponent from "./components/NewsletterSignupComponent";
import FaqAccordionComponent from "./components/FaqAccordionComponent";
import BannerCarouselComponent from "./components/BannerCarouselComponent";

interface ShopComponentWrapperProps {
    type: ComponentType;
    config: ComponentConfig;
    isBuilder?: boolean;
    onSelect?: () => void;
    isSelected?: boolean;
    products?: Array<{
        id: string;
        name: string;
        price: number;
        images: string[];
    }>;
    vendorId?: string;
}

export default function ShopComponentWrapper({
    type,
    config,
    isBuilder = false,
    onSelect,
    isSelected = false,
    products,
    vendorId,
}: ShopComponentWrapperProps) {
    const handleClick = () => {
        if (isBuilder && onSelect) {
            onSelect();
        }
    };

    const getComponentLabel = () => {
        switch (type) {
            case "HERO": return "hero section";
            case "PRODUCT_GRID": return "product grid";
            case "IMAGE_GALLERY": return "image gallery";
            case "VIDEO_EMBED": return "video embed";
            case "TEXT_BLOCK": return "text block";
            case "SPACER": return "spacer";
            case "TESTIMONIALS": return "testimonials";
            case "FEATURED_COLLECTION": return "featured collection";
            case "COUNTDOWN_TIMER": return "countdown timer";
            case "NEWSLETTER_SIGNUP": return "newsletter";
            case "FAQ_ACCORDION": return "FAQ";
            case "BANNER_CAROUSEL": return "banner carousel";
            default: return "component";
        }
    };

    const getComponentColor = () => {
        switch (type) {
            case "HERO": return "border-primary-500/50 bg-primary-50/10";
            case "PRODUCT_GRID": return "border-secondary-500/50 bg-secondary-50/10";
            case "IMAGE_GALLERY": return "border-success-500/50 bg-success-50/10";
            case "VIDEO_EMBED": return "border-warning-500/50 bg-warning-50/10";
            case "TEXT_BLOCK": return "border-danger-500/50 bg-danger-50/10";
            case "SPACER": return "border-default-500/50 bg-default-50/10";
            case "TESTIMONIALS": return "border-pink-500/50 bg-pink-50/10";
            case "FEATURED_COLLECTION": return "border-purple-500/50 bg-purple-50/10";
            case "COUNTDOWN_TIMER": return "border-orange-500/50 bg-orange-50/10";
            case "NEWSLETTER_SIGNUP": return "border-cyan-500/50 bg-cyan-50/10";
            case "FAQ_ACCORDION": return "border-teal-500/50 bg-teal-50/10";
            case "BANNER_CAROUSEL": return "border-indigo-500/50 bg-indigo-50/10";
            default: return "border-default-300";
        }
    };

    const getBadgeColor = () => {
        switch (type) {
            case "HERO": return "bg-primary-500 text-white";
            case "PRODUCT_GRID": return "bg-secondary-500 text-white";
            case "IMAGE_GALLERY": return "bg-success-500 text-white";
            case "VIDEO_EMBED": return "bg-warning-500 text-white";
            case "TEXT_BLOCK": return "bg-danger-500 text-white";
            case "SPACER": return "bg-default-500 text-white";
            case "TESTIMONIALS": return "bg-pink-500 text-white";
            case "FEATURED_COLLECTION": return "bg-purple-500 text-white";
            case "COUNTDOWN_TIMER": return "bg-orange-500 text-white";
            case "NEWSLETTER_SIGNUP": return "bg-cyan-500 text-white";
            case "FAQ_ACCORDION": return "bg-teal-500 text-white";
            case "BANNER_CAROUSEL": return "bg-indigo-500 text-white";
            default: return "bg-default-500 text-white";
        }
    };

    const wrapperClasses = isBuilder
        ? `relative border-2 transition-all ${isSelected
            ? "border-primary ring-2 ring-primary ring-offset-2"
            : `hover:border-primary/50 ${getComponentColor()}`
        }`
        : "";

    return (
        <div className={wrapperClasses} onClick={handleClick}>
            {isBuilder && (
                <div className={`absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold lowercase tracking-wider z-10 ${getBadgeColor()}`}>
                    {getComponentLabel()}
                </div>
            )}
            {type === "HERO" && <HeroComponent config={config as HeroConfig} />}
            {type === "PRODUCT_GRID" && <ProductGridComponent config={config as ProductGridConfig} products={products} vendorId={vendorId} />}
            {type === "IMAGE_GALLERY" && <ImageGalleryComponent config={config as ImageGalleryConfig} />}
            {type === "VIDEO_EMBED" && <VideoEmbedComponent config={config as VideoEmbedConfig} />}
            {type === "TEXT_BLOCK" && <TextBlockComponent config={config as TextBlockConfig} />}
            {type === "SPACER" && <SpacerComponent config={config as SpacerConfig} />}
            {type === "TESTIMONIALS" && <TestimonialsComponent config={config as TestimonialsConfig} />}
            {type === "FEATURED_COLLECTION" && <FeaturedCollectionComponent config={config as FeaturedCollectionConfig} />}
            {type === "COUNTDOWN_TIMER" && <CountdownTimerComponent config={config as CountdownTimerConfig} />}
            {type === "NEWSLETTER_SIGNUP" && <NewsletterSignupComponent config={config as NewsletterSignupConfig} />}
            {type === "FAQ_ACCORDION" && <FaqAccordionComponent config={config as FaqAccordionConfig} />}
            {type === "BANNER_CAROUSEL" && <BannerCarouselComponent config={config as BannerCarouselConfig} />}
        </div>
    );
}

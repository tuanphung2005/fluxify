import { ComponentType } from "@prisma/client";

import {
  HeroConfig,
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
  MapLocationConfig,
  ComponentConfig,
} from "@/types/shop";

export const DEFAULT_CONFIGS: Record<ComponentType, ComponentConfig> = {
  HERO: {
    title: "Welcome to Our Shop",
    subtitle: "Discover amazing products",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
    ctaText: "Shop Now",
    ctaLink: "#",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
  } as HeroConfig,



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

  // New component defaults
  TESTIMONIALS: {
    title: "What Our Customers Say",
    testimonials: [
      {
        name: "John Doe",
        rating: 5,
        comment:
          "Amazing products and fast shipping! Highly recommend this store.",
        role: "Verified Buyer",
      },
      {
        name: "Jane Smith",
        rating: 5,
        comment:
          "Great quality and excellent customer service. Will buy again!",
        role: "Verified Buyer",
      },
    ],
    layout: "carousel",
  } as TestimonialsConfig,

  FEATURED_COLLECTION: {
    title: "Featured Collection",
    description: "Hand-picked products just for you",
    productIds: [],
    layout: "grid",
    columns: 4,
    showAddToCart: true,
    showAllProducts: false,
    showSearchBar: true,
  } as FeaturedCollectionConfig,

  COUNTDOWN_TIMER: {
    title: "Flash Sale Ends In",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    subtitle: "Don't miss out on our biggest sale of the year!",
    expiredMessage: "This sale has ended",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
  } as CountdownTimerConfig,

  NEWSLETTER_SIGNUP: {
    title: "Stay in the Loop",
    subtitle: "Subscribe to our newsletter for exclusive deals and updates",
    buttonText: "Subscribe",
    placeholder: "Enter your email",
    backgroundColor: "#f8fafc",
  } as NewsletterSignupConfig,

  FAQ_ACCORDION: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy on all items. If you're not satisfied with your purchase, you can return it for a full refund.",
      },
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes! We ship to over 100 countries worldwide. International shipping typically takes 7-14 business days.",
      },
    ],
  } as FaqAccordionConfig,

  BANNER_CAROUSEL: {
    banners: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
        title: "New Arrivals",
        subtitle: "Check out our latest collection",
        ctaText: "Shop Now",
        ctaLink: "#",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b",
        title: "Summer Sale",
        subtitle: "Up to 50% off selected items",
        ctaText: "View Deals",
        ctaLink: "#",
      },
    ],
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
  } as BannerCarouselConfig,

  MAP_LOCATION: {
    title: "Vị trí cửa hàng",
    address: "",
    embedUrl: "",
    height: 400,
    showDirections: true,
  } as MapLocationConfig,
};

/**
 * Get the default configuration for a component type
 */
export function getDefaultConfig(type: ComponentType): ComponentConfig {
  return DEFAULT_CONFIGS[type];
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { BannerCarouselConfig } from "@/types/shop";

interface BannerCarouselComponentProps {
    config: BannerCarouselConfig;
}

export default function BannerCarouselComponent({ config }: BannerCarouselComponentProps) {
    const {
        banners,
        autoplay = true,
        interval = 5000,
        showDots = true,
        showArrows = true
    } = config;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!autoplay || isPaused || banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoplay, interval, banners.length, isPaused]);

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    if (!banners || banners.length === 0) {
        return null;
    }

    const currentBanner = banners[currentIndex];

    return (
        <section
            className="relative w-full overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative aspect-[21/9] md:aspect-[3/1]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="container mx-auto px-8 md:px-16">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="max-w-xl text-white"
                                    >
                                        {currentBanner.title && (
                                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                                {currentBanner.title}
                                            </h2>
                                        )}
                                        {currentBanner.subtitle && (
                                            <p className="text-lg md:text-xl opacity-90 mb-6">
                                                {currentBanner.subtitle}
                                            </p>
                                        )}
                                        {currentBanner.ctaText && currentBanner.ctaLink && (
                                            <Button
                                                as="a"
                                                href={currentBanner.ctaLink}
                                                color="primary"
                                                size="lg"
                                                endContent={<ExternalLink size={18} />}
                                            >
                                                {currentBanner.ctaText}
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {showArrows && banners.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Dots indicator */}
                {showDots && banners.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                        ? "bg-white w-8"
                                        : "bg-white/50"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

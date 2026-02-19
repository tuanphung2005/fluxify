"use client";

import type { BannerCarouselConfig } from "@/types/shop";

import { useState, useEffect } from "react";
import { m, LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface BannerCarouselComponentProps {
  config: BannerCarouselConfig;
}

export default function BannerCarouselComponent({
  config,
}: BannerCarouselComponentProps) {
  const {
    banners,
    autoplay = true,
    interval = 5000,
    showDots = true,
    showArrows = true,
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
    <LazyMotion features={domAnimation}>
      <section
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative aspect-[21/9] md:aspect-[3/1]">
          <AnimatePresence mode="wait">
            <m.div
              key={currentIndex}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
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
                    <m.div
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-xl text-white"
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
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
                          color="primary"
                          endContent={<ExternalLink size={18} />}
                          href={currentBanner.ctaLink}
                          size="lg"
                        >
                          {currentBanner.ctaText}
                        </Button>
                      )}
                    </m.div>
                  </div>
                </div>
              </div>
            </m.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          {showArrows && banners.length > 1 && (
            <>
              <button
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                onClick={goToPrev}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                onClick={goToNext}
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
                  aria-label={`Go to slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-white w-8" : "bg-white/50"
                    }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </LazyMotion>
  );
}

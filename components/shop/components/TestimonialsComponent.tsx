"use client";

import type { TestimonialsConfig } from "@/types/shop";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect } from "react";

import StarRating from "../StarRating";

interface TestimonialsComponentProps {
  config: TestimonialsConfig;
}

export default function TestimonialsComponent({
  config,
}: TestimonialsComponentProps) {
  const { title, testimonials, layout = "carousel", backgroundColor } = config;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (layout === "carousel" && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [layout, testimonials.length]);

  const goToPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        )}

        {layout === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-default-50">
                <CardBody className="p-6 space-y-4">
                  <Quote className="text-primary opacity-50" size={24} />
                  <p className="text-default-600 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar
                      name={testimonial.name}
                      size="md"
                      src={testimonial.avatar}
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      {testimonial.role && (
                        <p className="text-sm text-default-400">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} size="sm" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-2xl mx-auto text-center"
                  exit={{ opacity: 0, x: -50 }}
                  initial={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Quote
                    className="text-primary opacity-30 mx-auto mb-6"
                    size={48}
                  />
                  <p className="text-xl md:text-2xl text-default-600 italic mb-8">
                    "{testimonials[currentIndex].comment}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Avatar
                      name={testimonials[currentIndex].name}
                      size="lg"
                      src={testimonials[currentIndex].avatar}
                    />
                    <div className="text-left">
                      <p className="font-semibold text-lg">
                        {testimonials[currentIndex].name}
                      </p>
                      {testimonials[currentIndex].role && (
                        <p className="text-default-400">
                          {testimonials[currentIndex].role}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <StarRating
                      rating={testimonials[currentIndex].rating}
                      size="md"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  aria-label="Previous testimonial"
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                  onClick={goToPrev}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  aria-label="Next testimonial"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                  onClick={goToNext}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-primary w-6"
                        : "bg-default-300"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

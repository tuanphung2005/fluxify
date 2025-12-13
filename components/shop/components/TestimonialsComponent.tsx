"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import StarRating from "../StarRating";
import type { TestimonialsConfig } from "@/types/shop";

interface TestimonialsComponentProps {
    config: TestimonialsConfig;
}

export default function TestimonialsComponent({ config }: TestimonialsComponentProps) {
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
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
                                    <Quote size={24} className="text-primary opacity-50" />
                                    <p className="text-default-600 italic">
                                        "{testimonial.comment}"
                                    </p>
                                    <div className="flex items-center gap-3 pt-4">
                                        <Avatar
                                            name={testimonial.name}
                                            src={testimonial.avatar}
                                            size="md"
                                        />
                                        <div>
                                            <p className="font-semibold">{testimonial.name}</p>
                                            {testimonial.role && (
                                                <p className="text-sm text-default-400">{testimonial.role}</p>
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
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-w-2xl mx-auto text-center"
                                >
                                    <Quote size={48} className="text-primary opacity-30 mx-auto mb-6" />
                                    <p className="text-xl md:text-2xl text-default-600 italic mb-8">
                                        "{testimonials[currentIndex].comment}"
                                    </p>
                                    <div className="flex items-center justify-center gap-4">
                                        <Avatar
                                            name={testimonials[currentIndex].name}
                                            src={testimonials[currentIndex].avatar}
                                            size="lg"
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
                                    onClick={goToPrev}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                                    aria-label="Previous testimonial"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                                    aria-label="Next testimonial"
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
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                            ? "bg-primary w-6"
                                            : "bg-default-300"
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
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

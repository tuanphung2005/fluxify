"use client";

import { Button } from "@heroui/button";
import { HeroConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";
import { ArrowRight } from "lucide-react";

export default function HeroComponent({ config }: BaseComponentProps<HeroConfig>) {
    const {
        title = "Welcome to Our Store",
        subtitle = "Discover amazing products",
        imageUrl = "/api/placeholder/1200/600",
        ctaText,
        ctaLink,
        backgroundColor = "#000000",
        textColor = "#FFFFFF",
    } = config as HeroConfig;

    return (
        <div
            className="relative w-full h-[500px] flex items-center justify-center overflow-hidden"
            style={{
                backgroundColor,
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 text-center px-6 max-w-4xl">
                <h1
                    className="text-5xl md:text-7xl font-bold mb-4"
                    style={{ color: textColor }}
                >
                    {title}
                </h1>
                <p
                    className="text-xl md:text-2xl mb-8"
                    style={{ color: textColor, opacity: 0.9 }}
                >
                    {subtitle}
                </p>
                {ctaText && (
                    <Button
                        size="lg"
                        color="primary"
                        endContent={<ArrowRight className="w-5 h-5" />}
                        as={ctaLink ? "a" : "button"}
                        href={ctaLink}
                        className="font-semibold"
                    >
                        {ctaText}
                    </Button>
                )}
            </div>
        </div>
    );
}

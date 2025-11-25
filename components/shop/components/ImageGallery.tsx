"use client";

import { ImageGalleryConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";
import { Image } from "@heroui/image";

export default function ImageGallery ({
    config,
}: BaseComponentProps<ImageGalleryConfig>) {
    const {
        images = [
            { url: "/api/placeholder/600/400", alt: "Gallery Image 1" },
            { url: "/api/placeholder/600/400", alt: "Gallery Image 2" },
            { url: "/api/placeholder/600/400", alt: "Gallery Image 3" },
        ],
        columns = 3,
        aspectRatio = "landscape",
    } = config as ImageGalleryConfig;

    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

    const aspectClasses = {
        square: "aspect-square",
        landscape: "aspect-video",
        portrait: "aspect-[3/4]",
    }[aspectRatio];

    return (
        <div className="py-12 px-6">
            <div className={`grid ${gridCols} gap-4 max-w-7xl mx-auto`}>
                {images.map((image, index) => (
                    <div key={index} className={`relative overflow-hidden ${aspectClasses}`}>
                        <Image
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            width="100%"
                            height="100%"
                        />
                        {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                                <p className="text-sm">{image.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

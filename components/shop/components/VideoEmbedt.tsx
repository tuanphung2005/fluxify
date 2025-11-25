"use client";

import { VideoEmbedConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";

export default function VideoEmbed ({
    config,
}: BaseComponentProps<VideoEmbedConfig>) {
    const {
        videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
        title,
        autoplay = false,
        loop = false,
        aspectRatio = "16:9",
    } = config as VideoEmbedConfig;

    const getEmbedUrl = (url: string) => {
        // YouTube
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const videoId =
                url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
            return `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}${loop ? "&loop=1" : ""}`;
        }
        // Direct URL
        return url;
    };

    const aspectClasses = {
        "16:9": "aspect-video",
        "4:3": "aspect-[4/3]",
        "1:1": "aspect-square",
    }[aspectRatio];

    const embedUrl = getEmbedUrl(videoUrl);

    return (
        <div className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {title && <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>}
                <div className={`relative ${aspectClasses} w-full overflow-hidden rounded-lg`}>
                    <iframe
                        src={embedUrl}
                        title={title || "Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
}

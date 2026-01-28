"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@heroui/button";

import { MapLocationConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";

export default function MapLocationComponent({
    config,
}: BaseComponentProps<MapLocationConfig>) {
    const {
        title = "Vị trí cửa hàng",
        address = "",
        height = 400,
        showDirections = true,
    } = config as MapLocationConfig;

    // Auto-generate embed URL from address (no API key needed)
    const getEmbedUrl = () => {
        if (!address) return "";
        const encodedAddress = encodeURIComponent(address);
        return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
    };

    const getDirectionsUrl = () => {
        const encodedAddress = encodeURIComponent(address);
        return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    };

    const embedUrl = getEmbedUrl();

    return (
        <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                {title && (
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                            <MapPin className="text-primary" size={28} />
                            {title}
                        </h2>
                        {address && (
                            <p className="text-default-600 text-lg">{address}</p>
                        )}
                    </div>
                )}

                {/* Map Embed */}
                {embedUrl ? (
                    <div
                        className="rounded-xl overflow-hidden shadow-lg border border-default-200"
                        style={{ height: `${height}px` }}
                    >
                        <iframe
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={embedUrl}
                            style={{ border: 0, width: "100%", height: "100%" }}
                            title="Google Maps"
                        />
                    </div>
                ) : (
                    <div
                        className="rounded-xl bg-default-100 flex items-center justify-center border border-default-200"
                        style={{ height: `${height}px` }}
                    >
                        <div className="text-center text-default-500">
                            <MapPin className="mx-auto mb-2 opacity-50" size={48} />
                            <p>Nhập địa chỉ để hiển thị bản đồ</p>
                        </div>
                    </div>
                )}

                {/* Get Directions Button */}
                {showDirections && address && (
                    <div className="text-center mt-6">
                        <Button
                            as="a"
                            color="primary"
                            endContent={<ExternalLink size={16} />}
                            href={getDirectionsUrl()}
                            rel="noopener noreferrer"
                            size="lg"
                            target="_blank"
                            variant="flat"
                        >
                            Chỉ đường đến cửa hàng
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}

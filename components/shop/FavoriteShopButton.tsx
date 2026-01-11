"use client";

import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

interface FavoriteShopButtonProps {
    vendorId: string;
}

export default function FavoriteShopButton({ vendorId }: FavoriteShopButtonProps) {
    const { data: session, status } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Check if shop is already favorited
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (status !== "authenticated") {
                setIsChecking(false);
                return;
            }

            try {
                const data = await api.get<{ favoriteShops: { vendor: { id: string } }[] }>(
                    "/api/user/personal"
                );
                const isFav = data.favoriteShops.some(shop => shop.vendor.id === vendorId);
                setIsFavorite(isFav);
            } catch (error) {
                console.error("Failed to check favorite status:", error);
            } finally {
                setIsChecking(false);
            }
        };

        checkFavoriteStatus();
    }, [vendorId, status]);

    const handleToggleFavorite = async () => {
        if (status !== "authenticated") {
            toast.error("Please log in to save favorites");
            return;
        }

        setIsLoading(true);
        try {
            if (isFavorite) {
                // Remove from favorites
                await api.delete("/api/user/personal/favorite-shops", { vendorId });
                setIsFavorite(false);
                toast.success("Shop removed from favorites");
            } else {
                // Add to favorites
                await api.post("/api/user/personal/favorite-shops", { vendorId });
                setIsFavorite(true);
                toast.success("Shop added to favorites!");
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            toast.error("Failed to update favorites");
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show loading state during initial check
    if (isChecking) {
        return (
            <Button
                isIconOnly
                color="default"
                variant="flat"
                className="shadow-lg bg-background/80 backdrop-blur-sm"
                size="lg"
                isDisabled
            >
                <Heart size={24} />
            </Button>
        );
    }

    return (
        <Tooltip
            content={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            placement="left"
        >
            <Button
                isIconOnly
                color={isFavorite ? "danger" : "default"}
                variant={isFavorite ? "solid" : "flat"}
                className={`shadow-lg ${!isFavorite ? "bg-background/80 backdrop-blur-sm" : ""}`}
                size="lg"
                onPress={handleToggleFavorite}
                isLoading={isLoading}
                aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
            </Button>
        </Tooltip>
    );
}

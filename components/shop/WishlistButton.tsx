"use client";

import { Heart } from "lucide-react";
import { Button } from "@heroui/button";
import { useWishlistStore } from "@/store/wishlist-store";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";

interface WishlistButtonProps {
    productId: string;
    size?: "sm" | "md" | "lg";
    variant?: "flat" | "solid" | "bordered" | "light" | "ghost";
    showLabel?: boolean;
    className?: string;
}

export default function WishlistButton({
    productId,
    size = "md",
    variant = "light",
    showLabel = false,
    className = "",
}: WishlistButtonProps) {
    const { isInWishlist, addItem, removeItem, fetchWishlist, isInitialized } = useWishlistStore();
    const [isLoading, setIsLoading] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            fetchWishlist();
        }
    }, [isInitialized, fetchWishlist]);

    useEffect(() => {
        setInWishlist(isInWishlist(productId));
    }, [isInWishlist, productId]);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            if (inWishlist) {
                await removeItem(productId);
                addToast({
                    title: "Removed from wishlist",
                    color: "default",
                });
            } else {
                await addItem(productId);
                addToast({
                    title: "Added to wishlist",
                    color: "success",
                });
            }
            setInWishlist(!inWishlist);
        } catch (error) {
            addToast({
                title: "Please log in to use wishlist",
                color: "warning",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

    return (
        <Button
            isIconOnly={!showLabel}
            size={size}
            variant={variant}
            onPress={handleToggle}
            isLoading={isLoading}
            className={`${inWishlist ? "text-danger" : "text-default-500"} ${className}`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={iconSize}
                fill={inWishlist ? "currentColor" : "none"}
                className="transition-all duration-200"
            />
            {showLabel && (
                <span className="ml-2">
                    {inWishlist ? "Saved" : "Save"}
                </span>
            )}
        </Button>
    );
}

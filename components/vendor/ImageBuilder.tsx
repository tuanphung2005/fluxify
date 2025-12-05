"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import { Image as HeroUIImage } from "@heroui/image";
import { Plus, X } from "lucide-react";

interface ImageBuilderProps {
    value: string;
    onChange: (value: string) => void;
}

export default function ImageBuilder({ value, onChange }: ImageBuilderProps) {
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");

    useEffect(() => {
        try {
            if (value) {
                const parsed = value.split("\n").filter(url => url.trim() !== "");
                setImages(parsed);
            } else {
                setImages([]);
            }
        } catch (e) {
            console.error("Invalid image URLs", e);
            setImages([]);
        }
    }, [value]);

    const updateParent = (newImages: string[]) => {
        const imageString = newImages.join("\n");
        onChange(imageString);
    };

    const handleAddImage = () => {
        if (!newImageUrl.trim()) return;

        const updatedImages = [...images, newImageUrl.trim()];
        setImages(updatedImages);
        updateParent(updatedImages);
        setNewImageUrl("");
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        updateParent(updatedImages);
    };

    return (
        <div className="flex flex-col gap-3 p-4 border border-default-200 rounded-lg">
            {/* Add Image Input */}
            <div className="flex gap-2">
                <Input
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onValueChange={setNewImageUrl}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImage();
                        }
                    }}

                    size="sm"
                />
                <Button
                    color="primary"
                    variant="flat"
                    isIconOnly
                    onPress={handleAddImage}
                    size="sm"

                >
                    <Plus size={16} />
                </Button>
            </div>

            {/* Image List */}
            {images.length > 0 && (
                <div className="flex flex-col gap-2">
                    {images.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-default-50 rounded">
                            <HeroUIImage
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-12 h-12 object-cover rounded"
                                width={48}
                                height={48}
                                onError={() => {
                                    // Handle error if needed, though HeroUI Image handles fallback
                                }}
                            />
                            <span className="flex-1 text-sm truncate text-default-600">
                                {url}
                            </span>
                            <Button
                                color="danger"
                                variant="light"
                                isIconOnly
                                size="sm"
                                onPress={() => handleRemoveImage(index)}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-4 text-small text-default-400">
                    No images added yet
                </div>
            )}
        </div>
    );
}

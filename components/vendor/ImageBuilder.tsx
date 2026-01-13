"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Input, Progress } from "@heroui/react";
import { Image as HeroUIImage } from "@heroui/image";
import { Plus, X, Upload, Link as LinkIcon } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

interface ImageBuilderProps {
    value: string;
    onChange: (value: string) => void;
}

export default function ImageBuilder({ value, onChange }: ImageBuilderProps) {
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<"upload" | "url">("upload");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { upload, uploadMultiple, isUploading, progress, error, reset } = useCloudinaryUpload();

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

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        reset();

        const fileArray = Array.from(files);
        const results = await uploadMultiple(fileArray);

        if (results.length > 0) {
            const newUrls = results.map(r => r.url);
            const updatedImages = [...images, ...newUrls];
            setImages(updatedImages);
            updateParent(updatedImages);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, [images]);

    return (
        <div className="flex flex-col gap-3 p-4 border border-default-200 rounded-lg">
            {/* Mode Toggle */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant={mode === "upload" ? "solid" : "flat"}
                    color={mode === "upload" ? "primary" : "default"}
                    startContent={<Upload size={14} />}
                    onPress={() => setMode("upload")}
                >
                    Tải ảnh lên
                </Button>
                <Button
                    size="sm"
                    variant={mode === "url" ? "solid" : "flat"}
                    color={mode === "url" ? "primary" : "default"}
                    startContent={<LinkIcon size={14} />}
                    onPress={() => setMode("url")}
                >
                    URL
                </Button>
            </div>

            {mode === "upload" ? (
                <>
                    {/* Drop Zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${isDragging
                                ? "border-primary bg-primary/10"
                                : "border-default-300 hover:border-primary/50 hover:bg-default-50"
                            } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files)}
                        />
                        <div className="flex flex-col items-center gap-2 text-default-500">
                            <Upload size={32} className={isDragging ? "text-primary" : ""} />
                            <p className="text-sm text-center">
                                {isDragging
                                    ? "Thả ảnh vào đây"
                                    : "Kéo thả ảnh hoặc click để chọn"}
                            </p>
                            <p className="text-xs text-default-400">
                                JPEG, PNG, WebP, GIF (tối đa 10MB)
                            </p>
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="flex flex-col gap-1">
                            <Progress
                                size="sm"
                                value={progress}
                                color="primary"
                                aria-label="Upload progress"
                            />
                            <p className="text-xs text-default-500 text-center">
                                Đang tải lên... {progress}%
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <p className="text-xs text-danger text-center">{error}</p>
                    )}
                </>
            ) : (
                /* URL Input Mode */
                <div className="flex gap-2">
                    <Input
                        placeholder="Nhập URL hình ảnh"
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
            )}

            {/* Image List */}
            {images.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-default-500">{images.length} ảnh</p>
                    {images.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-default-50 rounded">
                            <HeroUIImage
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-12 h-12 object-cover rounded"
                                width={48}
                                height={48}
                            />
                            <span className="flex-1 text-sm truncate text-default-600">
                                {url.includes('cloudinary') ? 'Cloudinary image' : url}
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

            {images.length === 0 && !isUploading && (
                <div className="text-center py-2 text-small text-default-400">
                    Chưa có ảnh nào
                </div>
            )}
        </div>
    );
}

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { X, Plus } from "lucide-react";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { ImageGalleryConfig as ImageGalleryConfigType } from "@/types/shop";

export default function ImageGallery({
    config,
    onUpdate,
}: BaseComponentConfigProps<ImageGalleryConfigType>) {
    const images = config.images || [];

    const handleAddImage = () => {
        const newImages = [...images, { url: "", alt: "" }];
        onUpdate("images", newImages);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_: any, i: number) => i !== index);
        onUpdate("images", newImages);
    };

    const handleUpdateImage = (index: number, field: string, value: string) => {
        const newImages = images.map((img: any, i: number) =>
            i === index ? { ...img, [field]: value } : img
        );
        onUpdate("images", newImages);
    };

    return (
        <>
            <Select
                label="Columns"
                selectedKeys={[String(config.columns || 3)]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("columns", Number(value));
                }}
            >
                <SelectItem key="2">2 Columns</SelectItem>
                <SelectItem key="3">3 Columns</SelectItem>
                <SelectItem key="4">4 Columns</SelectItem>
            </Select>

            <Select
                label="Aspect Ratio"
                selectedKeys={[config.aspectRatio || "landscape"]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("aspectRatio", value);
                }}
            >
                <SelectItem key="square">Square (1:1)</SelectItem>
                <SelectItem key="video">Video (16:9)</SelectItem>
                <SelectItem key="portrait">Portrait (3:4)</SelectItem>
                <SelectItem key="landscape">Landscape (4:3)</SelectItem>
            </Select>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Images</label>
                    <Button
                        size="sm"
                        variant="flat"
                        startContent={<Plus className="w-4 h-4" />}
                        onPress={handleAddImage}
                    >
                        Add Image
                    </Button>
                </div>

                <div className="space-y-4">
                    {images.map((image: any, index: number) => (
                        <div
                            key={index}
                            className="p-3 bg-default-100 rounded-lg space-y-2 relative group"
                        >
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onPress={() => handleRemoveImage(index)}
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            <Input
                                size="sm"
                                label="Image URL"
                                value={image.url}
                                onValueChange={(value) =>
                                    handleUpdateImage(index, "url", value)
                                }
                            />
                            <Input
                                size="sm"
                                label="Alt Text"
                                value={image.alt}
                                onValueChange={(value) =>
                                    handleUpdateImage(index, "alt", value)
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

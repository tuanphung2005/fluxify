import { useRef } from "react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { X, Plus, Upload, Loader2, Image as ImageIcon } from "lucide-react";

import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { ImageGalleryConfig as ImageGalleryConfigType } from "@/types/shop";

interface GalleryImageProps {
  image: { url: string; alt: string; caption?: string };
  index: number;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

function GalleryImageRow({
  image,
  index,
  onUpdate,
  onRemove,
}: GalleryImageProps) {
  const { upload, isUploading } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const result = await upload(file);

      if (result) {
        onUpdate(index, "url", result.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-3 bg-default-100 rounded-lg space-y-3 relative group">
      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />

      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-semibold text-default-500 uppercase mt-1">
          Image {index + 1}
        </h4>
        <Button
          isIconOnly
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 min-w-6"
          color="danger"
          size="sm"
          variant="light"
          onPress={() => onRemove(index)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          className="flex-1"
          label="Image URL"
          placeholder="https://..."
          size="sm"
          startContent={
            <ImageIcon className="w-3 h-3 text-default-400 pointer-events-none flex-shrink-0" />
          }
          value={image.url}
          onValueChange={(value) => onUpdate(index, "url", value)}
        />
        <Button
          isIconOnly
          isLoading={isUploading}
          className="h-full aspect-square"
          color="primary"
          title="Upload Image"
          variant="flat"
          onPress={handleUploadClick}
        >
          {!isUploading && <Upload className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Alt Text"
          placeholder="Description"
          size="sm"
          value={image.alt}
          onValueChange={(value) => onUpdate(index, "alt", value)}
        />
        <Input
          label="Caption (Optional)"
          placeholder="Caption"
          size="sm"
          value={image.caption || ""}
          onValueChange={(value) => onUpdate(index, "caption", value)}
        />
      </div>
    </div>
  );
}

export default function ImageGallery({
  config,
  onUpdate,
}: BaseComponentConfigProps<ImageGalleryConfigType>) {
  const images = config.images || [];

  const handleAddImage = () => {
    const newImages = [...images, { url: "", alt: "", caption: "" }];

    onUpdate("images", newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_: any, i: number) => i !== index);

    onUpdate("images", newImages);
  };

  const handleUpdateImage = (index: number, field: string, value: string) => {
    const newImages = images.map((img: any, i: number) =>
      i === index ? { ...img, [field]: value } : img,
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
            startContent={<Plus className="w-4 h-4" />}
            variant="flat"
            onPress={handleAddImage}
          >
            Add Image
          </Button>
        </div>

        <div className="space-y-4">
          {images.map((image: any, index: number) => (
            <GalleryImageRow
              key={index}
              image={image}
              index={index}
              onRemove={handleRemoveImage}
              onUpdate={handleUpdateImage}
            />
          ))}
        </div>
      </div>
    </>
  );
}

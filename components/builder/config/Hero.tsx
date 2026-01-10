import { Input } from "@heroui/input";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { HeroConfig as HeroConfigType } from "@/types/shop";

export default function Hero({ config, onUpdate }: BaseComponentConfigProps<HeroConfigType>) {
    return (
        <>
            <Input
                label="Tiêu đề"
                value={config.title || ""}
                onValueChange={(value) => onUpdate("title", value)}
            />
            <Input
                label="Phụ đề"
                value={config.subtitle || ""}
                onValueChange={(value) => onUpdate("subtitle", value)}
            />
            <Input
                label="URL Hình ảnh"
                value={config.imageUrl || ""}
                onValueChange={(value) => onUpdate("imageUrl", value)}
            />
            <Input
                label="Nút CTA (Tùy chọn)"
                value={config.ctaText || ""}
                onValueChange={(value) => onUpdate("ctaText", value)}
            />
            <Input
                label="Liên kết CTA (Tùy chọn)"
                value={config.ctaLink || ""}
                onValueChange={(value) => onUpdate("ctaLink", value)}
            />
            <Input
                type="color"
                label="Màu nền"
                value={config.backgroundColor || "#000000"}
                onValueChange={(value) => onUpdate("backgroundColor", value)}
            />
            <Input
                type="color"
                label="Màu chữ"
                value={config.textColor || "#FFFFFF"}
                onValueChange={(value) => onUpdate("textColor", value)}
            />
        </>
    );
}

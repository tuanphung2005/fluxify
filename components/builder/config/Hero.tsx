import { Input } from "@heroui/input";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { HeroConfig as HeroConfigType } from "@/types/shop";

export default function Hero({ config, onUpdate }: BaseComponentConfigProps<HeroConfigType>) {
    return (
        <>
            <Input
                label="Title"
                value={config.title || ""}
                onValueChange={(value) => onUpdate("title", value)}
            />
            <Input
                label="Subtitle"
                value={config.subtitle || ""}
                onValueChange={(value) => onUpdate("subtitle", value)}
            />
            <Input
                label="Image URL"
                value={config.imageUrl || ""}
                onValueChange={(value) => onUpdate("imageUrl", value)}
            />
            <Input
                label="CTA Text (Optional)"
                value={config.ctaText || ""}
                onValueChange={(value) => onUpdate("ctaText", value)}
            />
            <Input
                label="CTA Link (Optional)"
                value={config.ctaLink || ""}
                onValueChange={(value) => onUpdate("ctaLink", value)}
            />
            <Input
                type="color"
                label="Background Color"
                value={config.backgroundColor || "#000000"}
                onValueChange={(value) => onUpdate("backgroundColor", value)}
            />
            <Input
                type="color"
                label="Text Color"
                value={config.textColor || "#FFFFFF"}
                onValueChange={(value) => onUpdate("textColor", value)}
            />
        </>
    );
}

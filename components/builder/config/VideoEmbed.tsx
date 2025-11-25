import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { VideoEmbedConfig as VideoEmbedConfigType } from "@/types/shop";

export default function VideoEmbed({
    config,
    onUpdate,
}: BaseComponentConfigProps<VideoEmbedConfigType>) {
    return (
        <>
            <Input
                label="Video URL (YouTube/Vimeo)"
                value={config.videoUrl || ""}
                onValueChange={(value) => onUpdate("videoUrl", value)}
                placeholder="https://www.youtube.com/watch?v=..."
            />
            <Input
                label="Title (Optional)"
                value={config.title || ""}
                onValueChange={(value) => onUpdate("title", value)}
            />
            <Select
                label="Aspect Ratio"
                selectedKeys={[config.aspectRatio || "16:9"]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("aspectRatio", value);
                }}
            >
                <SelectItem key="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem key="4:3">4:3 (Standard)</SelectItem>
                <SelectItem key="1:1">1:1 (Square)</SelectItem>
                <SelectItem key="9:16">9:16 (Vertical)</SelectItem>
            </Select>
            <Switch
                isSelected={config.autoplay ?? false}
                onValueChange={(value) => onUpdate("autoplay", value)}
            >
                Autoplay
            </Switch>
            <Switch
                isSelected={config.loop ?? false}
                onValueChange={(value) => onUpdate("loop", value)}
            >
                Loop Video
            </Switch>
        </>
    );
}

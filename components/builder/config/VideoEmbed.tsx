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
        label="Đường dẫn video Youtube"
        placeholder="https://www.youtube.com/watch?v=..."
        value={config.videoUrl || ""}
        onValueChange={(value) => onUpdate("videoUrl", value)}
      />
      <Input
        label="Tiêu đề (Không bắt buộc)"
        value={config.title || ""}
        onValueChange={(value) => onUpdate("title", value)}
      />
      <Select
        label="Tỷ lệ khung hình"
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
        Tự động phát
      </Switch>
      <Switch
        isSelected={config.loop ?? false}
        onValueChange={(value) => onUpdate("loop", value)}
      >
        Lặp lại video
      </Switch>
    </>
  );
}

"use client";

import type { BannerCarouselConfig } from "@/types/shop";

import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Plus, Trash2, Image } from "lucide-react";

interface BannerCarouselConfigPanelProps {
  config: BannerCarouselConfig;
  onUpdate: (
    field: string | Partial<BannerCarouselConfig>,
    value?: unknown,
  ) => void;
}

export default function BannerCarouselConfigPanel({
  config,
  onUpdate,
}: BannerCarouselConfigPanelProps) {
  const banners = config.banners || [];

  const addBanner = () => {
    const newBanner = {
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      title: "Tên Banner",
      subtitle: "Mô tả Banner",
      ctaText: "Mua ngay",
      ctaLink: "#",
    };

    onUpdate("banners", [...banners, newBanner]);
  };

  const removeBanner = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);

    onUpdate("banners", updated);
  };

  const updateBanner = (index: number, field: string, value: string) => {
    const updated = [...banners];

    updated[index] = { ...updated[index], [field]: value };
    onUpdate("banners", updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Switch
          isSelected={config.autoplay !== false}
          onValueChange={(v) => onUpdate("autoplay", v)}
        >
          Tự động phát
        </Switch>

        <Switch
          isSelected={config.showDots !== false}
          onValueChange={(v) => onUpdate("showDots", v)}
        >
          Hiển thị Dots
        </Switch>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Switch
          isSelected={config.showArrows !== false}
          onValueChange={(v) => onUpdate("showArrows", v)}
        >
          Hiển thị mũi tên
        </Switch>

        <Input
          label="Thời gian chuyển (ms)"
          size="sm"
          type="number"
          value={String(config.interval || 5000)}
          onValueChange={(v) => onUpdate("interval", Number(v))}
        />
      </div>

      <Divider />

      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Danh sách Banner ({banners.length})</h4>
        <Button color="primary" size="sm" variant="flat" onPress={addBanner}>
          <Plus size={16} /> Thêm
        </Button>
      </div>

      {banners.map((banner, index) => (
        <div key={index} className="p-3 bg-default-100 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <Image size={14} /> Banner số {index + 1}
            </span>
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
              onPress={() => removeBanner(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          <Input
            label="URL ảnh"
            placeholder="https://..."
            size="sm"
            value={banner.imageUrl}
            onValueChange={(v) => updateBanner(index, "imageUrl", v)}
          />

          <Input
            label="Tiêu đề"
            size="sm"
            value={banner.title || ""}
            onValueChange={(v) => updateBanner(index, "title", v)}
          />

          <Input
            label="Phụ đề"
            size="sm"
            value={banner.subtitle || ""}
            onValueChange={(v) => updateBanner(index, "subtitle", v)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Nút CTAText"
              size="sm"
              value={banner.ctaText || ""}
              onValueChange={(v) => updateBanner(index, "ctaText", v)}
            />

            <Input
              label="Nút CTA Link"
              size="sm"
              value={banner.ctaLink || ""}
              onValueChange={(v) => updateBanner(index, "ctaLink", v)}
            />
          </div>
        </div>
      ))}

      {banners.length === 0 && (
        <div className="text-center py-6 bg-default-50 rounded-lg text-default-400">
          <Image className="mx-auto mb-2 opacity-50" size={32} />
          <p className="text-sm">Chưa có banner nào</p>
        </div>
      )}
    </div>
  );
}

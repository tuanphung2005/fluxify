"use client";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Slider } from "@heroui/react";

import { MapLocationConfig } from "@/types/shop";
import { BaseComponentConfigProps } from "@/types/shop-components";

export default function MapLocationConfigPanel({
    config,
    onUpdate,
}: BaseComponentConfigProps<MapLocationConfig>) {
    return (
        <div className="space-y-4">
            <Input
                label="Tiêu đề"
                placeholder="Vị trí cửa hàng"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
            />

            <Textarea
                description="Nhập địa chỉ và bản đồ sẽ tự động hiển thị"
                label="Địa chỉ"
                minRows={2}
                placeholder="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                value={config.address || ""}
                onValueChange={(v) => onUpdate("address", v)}
            />

            <div>
                <p className="text-sm text-default-700 mb-2">
                    Chiều cao bản đồ: {config.height || 400}px
                </p>
                <Slider
                    aria-label="Map height"
                    maxValue={600}
                    minValue={200}
                    step={50}
                    value={config.height || 400}
                    onChange={(v) => onUpdate("height", v as number)}
                />
            </div>

            <Switch
                isSelected={config.showDirections !== false}
                onValueChange={(v) => onUpdate("showDirections", v)}
            >
                Hiển thị nút Chỉ đường
            </Switch>
        </div>
    );
}

"use client";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import type { CountdownTimerConfig } from "@/types/shop";

interface CountdownTimerConfigPanelProps {
    config: CountdownTimerConfig;
    onUpdate: (field: string | Partial<CountdownTimerConfig>, value?: unknown) => void;
}

export default function CountdownTimerConfigPanel({ config, onUpdate }: CountdownTimerConfigPanelProps) {
    // Parse the ISO date to a local datetime-local format
    const getDateTimeLocalValue = () => {
        if (!config.endDate) return "";
        const date = new Date(config.endDate);
        return date.toISOString().slice(0, 16);
    };

    const handleDateChange = (value: string) => {
        if (value) {
            const date = new Date(value);
            onUpdate("endDate", date.toISOString());
        }
    };

    return (
        <div className="space-y-4">
            <Input
                label="Tiêu đề"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
                placeholder="Kết thúc sau"
            />

            <Textarea
                label="Phụ đề"
                value={config.subtitle || ""}
                onValueChange={(v) => onUpdate("subtitle", v)}
                placeholder="Đừng bỏ lỡ!"
                minRows={2}
            />

            <Input
                label="Thời gian kết thúc"
                type="datetime-local"
                value={getDateTimeLocalValue()}
                onChange={(e) => handleDateChange(e.target.value)}
            />

            <Input
                label="Thông báo khi kết thúc"
                value={config.expiredMessage || ""}
                onValueChange={(v) => onUpdate("expiredMessage", v)}
                placeholder="Chương trình đã kết thúc!"
            />

            <div className="grid grid-cols-2 gap-2">
                <Input
                    label="Màu nền"
                    type="color"
                    value={config.backgroundColor?.replace(/linear-gradient.*/, "#667eea") || "#667eea"}
                    onChange={(e) => onUpdate("backgroundColor", e.target.value)}
                />

                <Input
                    label="Màu chữ"
                    type="color"
                    value={config.textColor || "#ffffff"}
                    onChange={(e) => onUpdate("textColor", e.target.value)}
                />
            </div>

            <p className="text-xs text-default-400">
                Gợi ý: Để có màu nền gradient, hãy sửa trong CSS theme.
            </p>
        </div>
    );
}

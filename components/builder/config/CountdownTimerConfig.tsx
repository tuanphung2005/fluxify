"use client";

import type { CountdownTimerConfig } from "@/types/shop";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";

interface CountdownTimerConfigPanelProps {
  config: CountdownTimerConfig;
  onUpdate: (
    field: string | Partial<CountdownTimerConfig>,
    value?: unknown,
  ) => void;
}

export default function CountdownTimerConfigPanel({
  config,
  onUpdate,
}: CountdownTimerConfigPanelProps) {
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
        placeholder="Kết thúc sau"
        value={config.title || ""}
        onValueChange={(v) => onUpdate("title", v)}
      />

      <Textarea
        label="Phụ đề"
        minRows={2}
        placeholder="Đừng bỏ lỡ!"
        value={config.subtitle || ""}
        onValueChange={(v) => onUpdate("subtitle", v)}
      />

      <Input
        label="Thời gian kết thúc"
        type="datetime-local"
        value={getDateTimeLocalValue()}
        onChange={(e) => handleDateChange(e.target.value)}
      />

      <Input
        label="Thông báo khi kết thúc"
        placeholder="Chương trình đã kết thúc!"
        value={config.expiredMessage || ""}
        onValueChange={(v) => onUpdate("expiredMessage", v)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Màu nền"
          type="color"
          value={
            config.backgroundColor?.replace(/linear-gradient.*/, "#667eea") ||
            "#667eea"
          }
          onChange={(e) => onUpdate("backgroundColor", e.target.value)}
        />

        <Input
          label="Màu chữ"
          type="color"
          value={config.textColor || "#ffffff"}
          onChange={(e) => onUpdate("textColor", e.target.value)}
        />
      </div>


    </div>
  );
}

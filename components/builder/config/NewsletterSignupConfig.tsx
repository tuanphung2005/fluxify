"use client";

import type { NewsletterSignupConfig } from "@/types/shop";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";

interface NewsletterSignupConfigPanelProps {
  config: NewsletterSignupConfig;
  onUpdate: (
    field: string | Partial<NewsletterSignupConfig>,
    value?: unknown,
  ) => void;
}

export default function NewsletterSignupConfigPanel({
  config,
  onUpdate,
}: NewsletterSignupConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Tiêu đề"
        placeholder="Đăng ký nhận tin"
        value={config.title || ""}
        onValueChange={(v) => onUpdate("title", v)}
      />

      <Textarea
        label="Phụ đề"
        minRows={2}
        placeholder="Đăng ký để nhận ưu đãi độc quyền!"
        value={config.subtitle || ""}
        onValueChange={(v) => onUpdate("subtitle", v)}
      />

      <Input
        label="Nút đăng ký"
        placeholder="Đăng ký"
        value={config.buttonText || ""}
        onValueChange={(v) => onUpdate("buttonText", v)}
      />

      <Input
        label="Dòng nhắc (Placeholder)"
        placeholder="Nhập email của bạn"
        value={config.placeholder || ""}
        onValueChange={(v) => onUpdate("placeholder", v)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Màu nền"
          type="color"
          value={config.backgroundColor || "#f8fafc"}
          onChange={(e) => onUpdate("backgroundColor", e.target.value)}
        />

        <Input
          label="Màu chữ"
          type="color"
          value={config.textColor || "#000000"}
          onChange={(e) => onUpdate("textColor", e.target.value)}
        />
      </div>
    </div>
  );
}

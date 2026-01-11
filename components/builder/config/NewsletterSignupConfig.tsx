"use client";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import type { NewsletterSignupConfig } from "@/types/shop";

interface NewsletterSignupConfigPanelProps {
    config: NewsletterSignupConfig;
    onUpdate: (field: string | Partial<NewsletterSignupConfig>, value?: unknown) => void;
}

export default function NewsletterSignupConfigPanel({ config, onUpdate }: NewsletterSignupConfigPanelProps) {
    return (
        <div className="space-y-4">
            <Input
                label="Tiêu đề"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
                placeholder="Đăng ký nhận tin"
            />

            <Textarea
                label="Phụ đề"
                value={config.subtitle || ""}
                onValueChange={(v) => onUpdate("subtitle", v)}
                placeholder="Đăng ký để nhận ưu đãi độc quyền!"
                minRows={2}
            />

            <Input
                label="Nút đăng ký"
                value={config.buttonText || ""}
                onValueChange={(v) => onUpdate("buttonText", v)}
                placeholder="Đăng ký"
            />

            <Input
                label="Dòng nhắc (Placeholder)"
                value={config.placeholder || ""}
                onValueChange={(v) => onUpdate("placeholder", v)}
                placeholder="Nhập email của bạn"
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

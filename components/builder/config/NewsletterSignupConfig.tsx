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
                label="Title"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
                placeholder="Stay in the Loop"
            />

            <Textarea
                label="Subtitle"
                value={config.subtitle || ""}
                onValueChange={(v) => onUpdate("subtitle", v)}
                placeholder="Subscribe for exclusive deals!"
                minRows={2}
            />

            <Input
                label="Button Text"
                value={config.buttonText || ""}
                onValueChange={(v) => onUpdate("buttonText", v)}
                placeholder="Subscribe"
            />

            <Input
                label="Placeholder Text"
                value={config.placeholder || ""}
                onValueChange={(v) => onUpdate("placeholder", v)}
                placeholder="Enter your email"
            />

            <div className="grid grid-cols-2 gap-2">
                <Input
                    label="Background"
                    type="color"
                    value={config.backgroundColor || "#f8fafc"}
                    onChange={(e) => onUpdate("backgroundColor", e.target.value)}
                />

                <Input
                    label="Text Color"
                    type="color"
                    value={config.textColor || "#000000"}
                    onChange={(e) => onUpdate("textColor", e.target.value)}
                />
            </div>
        </div>
    );
}

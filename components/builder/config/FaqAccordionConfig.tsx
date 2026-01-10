"use client";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import type { FaqAccordionConfig } from "@/types/shop";

interface FaqAccordionConfigPanelProps {
    config: FaqAccordionConfig;
    onUpdate: (field: string | Partial<FaqAccordionConfig>, value?: unknown) => void;
}

export default function FaqAccordionConfigPanel({ config, onUpdate }: FaqAccordionConfigPanelProps) {
    const items = config.items || [];

    const addItem = () => {
        const newItem = {
            question: "Câu hỏi mới?",
            answer: "Câu trả lời của bạn...",
        };
        onUpdate("items", [...items, newItem]);
    };

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        onUpdate("items", updated);
    };

    const updateItem = (index: number, field: "question" | "answer", value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        onUpdate("items", updated);
    };

    return (
        <div className="space-y-4">
            <Input
                label="Tiêu đề"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
                placeholder="Câu hỏi thường gặp"
            />

            <Input
                label="Màu nền"
                type="color"
                value={config.backgroundColor || "#ffffff"}
                onChange={(e) => onUpdate("backgroundColor", e.target.value)}
            />

            <Divider />

            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Câu hỏi ({items.length})</h4>
                <Button size="sm" color="primary" variant="flat" onPress={addItem}>
                    <Plus size={16} /> Thêm
                </Button>
            </div>

            {items.map((item, index) => (
                <div key={index} className="p-3 bg-default-100 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <HelpCircle size={14} /> Q{index + 1}
                        </span>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => removeItem(index)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>

                    <Input
                        size="sm"
                        label="Câu hỏi"
                        value={item.question}
                        onValueChange={(v) => updateItem(index, "question", v)}
                    />

                    <Textarea
                        size="sm"
                        label="Câu trả lời"
                        value={item.answer}
                        onValueChange={(v) => updateItem(index, "answer", v)}
                        minRows={2}
                    />
                </div>
            ))}

            {items.length === 0 && (
                <div className="text-center py-6 bg-default-50 rounded-lg text-default-400">
                    <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có câu hỏi nào</p>
                </div>
            )}
        </div>
    );
}

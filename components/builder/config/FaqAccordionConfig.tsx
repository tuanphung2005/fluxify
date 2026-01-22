"use client";

import type { FaqAccordionConfig } from "@/types/shop";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Plus, Trash2, HelpCircle } from "lucide-react";

interface FaqAccordionConfigPanelProps {
  config: FaqAccordionConfig;
  onUpdate: (
    field: string | Partial<FaqAccordionConfig>,
    value?: unknown,
  ) => void;
}

export default function FaqAccordionConfigPanel({
  config,
  onUpdate,
}: FaqAccordionConfigPanelProps) {
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

  const updateItem = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const updated = [...items];

    updated[index] = { ...updated[index], [field]: value };
    onUpdate("items", updated);
  };

  return (
    <div className="space-y-4">
      <Input
        label="Tiêu đề"
        placeholder="Câu hỏi thường gặp"
        value={config.title || ""}
        onValueChange={(v) => onUpdate("title", v)}
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
        <Button color="primary" size="sm" variant="flat" onPress={addItem}>
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
              color="danger"
              size="sm"
              variant="light"
              onPress={() => removeItem(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          <Input
            label="Câu hỏi"
            size="sm"
            value={item.question}
            onValueChange={(v) => updateItem(index, "question", v)}
          />

          <Textarea
            label="Câu trả lời"
            minRows={2}
            size="sm"
            value={item.answer}
            onValueChange={(v) => updateItem(index, "answer", v)}
          />
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-6 bg-default-50 rounded-lg text-default-400">
          <HelpCircle className="mx-auto mb-2 opacity-50" size={32} />
          <p className="text-sm">Chưa có câu hỏi nào</p>
        </div>
      )}
    </div>
  );
}

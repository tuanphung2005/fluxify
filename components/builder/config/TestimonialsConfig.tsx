"use client";

import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Plus, Trash2, User } from "lucide-react";
import type { TestimonialsConfig } from "@/types/shop";

interface TestimonialsConfigPanelProps {
    config: TestimonialsConfig;
    onUpdate: (field: string | Partial<TestimonialsConfig>, value?: unknown) => void;
}

export default function TestimonialsConfigPanel({ config, onUpdate }: TestimonialsConfigPanelProps) {
    const testimonials = config.testimonials || [];

    const addTestimonial = () => {
        const newTestimonial = {
            name: "New Customer",
            rating: 5,
            comment: "Great product!",
            role: "Verified Buyer",
        };
        onUpdate("testimonials", [...testimonials, newTestimonial]);
    };

    const removeTestimonial = (index: number) => {
        const updated = testimonials.filter((_, i) => i !== index);
        onUpdate("testimonials", updated);
    };

    const updateTestimonial = (index: number, field: string, value: string | number) => {
        const updated = [...testimonials];
        updated[index] = { ...updated[index], [field]: value };
        onUpdate("testimonials", updated);
    };

    return (
        <div className="space-y-4">
            <Input
                label="Section Title"
                value={config.title || ""}
                onValueChange={(v) => onUpdate("title", v)}
                placeholder="What Our Customers Say"
            />

            <Select
                label="Layout"
                selectedKeys={[config.layout || "carousel"]}
                onSelectionChange={(keys) => onUpdate("layout", Array.from(keys)[0])}
            >
                <SelectItem key="carousel">Carousel</SelectItem>
                <SelectItem key="grid">Grid</SelectItem>
            </Select>

            <Input
                label="Background Color"
                type="color"
                value={config.backgroundColor || "#ffffff"}
                onChange={(e) => onUpdate("backgroundColor", e.target.value)}
            />

            <Divider />

            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Testimonials ({testimonials.length})</h4>
                <Button size="sm" color="primary" variant="flat" onPress={addTestimonial}>
                    <Plus size={16} /> Add
                </Button>
            </div>

            {testimonials.map((testimonial, index) => (
                <div key={index} className="p-3 bg-default-100 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <User size={14} /> #{index + 1}
                        </span>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => removeTestimonial(index)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>

                    <Input
                        size="sm"
                        label="Name"
                        value={testimonial.name}
                        onValueChange={(v) => updateTestimonial(index, "name", v)}
                    />

                    <Input
                        size="sm"
                        label="Role"
                        value={testimonial.role || ""}
                        onValueChange={(v) => updateTestimonial(index, "role", v)}
                        placeholder="e.g., Verified Buyer"
                    />

                    <Select
                        size="sm"
                        label="Rating"
                        selectedKeys={[String(testimonial.rating)]}
                        onSelectionChange={(keys) => updateTestimonial(index, "rating", Number(Array.from(keys)[0]))}
                    >
                        {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={String(r)}>{"⭐".repeat(r)} ({r})</SelectItem>
                        ))}
                    </Select>

                    <Textarea
                        size="sm"
                        label="Comment"
                        value={testimonial.comment}
                        onValueChange={(v) => updateTestimonial(index, "comment", v)}
                        minRows={2}
                    />

                    <Input
                        size="sm"
                        label="Avatar URL (optional)"
                        value={testimonial.avatar || ""}
                        onValueChange={(v) => updateTestimonial(index, "avatar", v)}
                        placeholder="https://..."
                    />
                </div>
            ))}
        </div>
    );
}

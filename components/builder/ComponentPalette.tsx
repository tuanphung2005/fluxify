"use client";

import { ComponentType } from "@prisma/client";
import { Card, CardBody } from "@heroui/card";
import {
    Image as ImageIcon,
    Video,
    Type,
    Grid3x3,
    LayoutTemplate,
    Space,
} from "lucide-react";
import { ComponentConfig } from "@/types/shop";
import { DEFAULT_CONFIGS } from "@/lib/shop/default-configs";

interface ComponentPaletteProps {
    onSelectComponent: (type: ComponentType, defaultConfig: ComponentConfig) => void;
}

const COMPONENT_METADATA = [
    {
        type: "HERO" as ComponentType,
        label: "Hero Banner",
        icon: LayoutTemplate,
        description: "Eye-catching header section",
    },
    {
        type: "PRODUCT_GRID" as ComponentType,
        label: "Product Grid",
        icon: Grid3x3,
        description: "Display your products",
    },
    {
        type: "IMAGE_GALLERY" as ComponentType,
        label: "Image Gallery",
        icon: ImageIcon,
        description: "Showcase images",
    },
    {
        type: "VIDEO_EMBED" as ComponentType,
        label: "Video",
        icon: Video,
        description: "Embed a video",
    },
    {
        type: "TEXT_BLOCK" as ComponentType,
        label: "Text Block",
        icon: Type,
        description: "Rich text content",
    },
    {
        type: "SPACER" as ComponentType,
        label: "Spacer",
        icon: Space,
        description: "Add vertical spacing",
    },
];

export default function ComponentPalette({ onSelectComponent }: ComponentPaletteProps) {
    return (
        <div className="w-64 bg-content1 border-r border-divider p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">components</h3>
            <div className="space-y-2">
                {COMPONENT_METADATA.map((component) => {
                    const Icon = component.icon;
                    return (
                        <Card
                            key={component.type}
                            isPressable
                            onPress={() =>
                                onSelectComponent(component.type, DEFAULT_CONFIGS[component.type])
                            }
                            className="hover:bg-primary/10 transition-colors"
                            radius="none"
                        >
                            <CardBody className="p-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <Icon className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{component.label}</h4>
                                        <p className="text-xs text-default-500">{component.description}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

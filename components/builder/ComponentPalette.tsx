"use client";

import { ComponentType } from "@prisma/client";
import { Card, CardBody } from "@heroui/card";
import { ComponentConfig } from "@/types/shop";
import { COMPONENT_REGISTRY, getAllComponentTypes } from "@/lib/registry/component-registry";

interface ComponentPaletteProps {
    onSelectComponent: (type: ComponentType, defaultConfig: ComponentConfig) => void;
}

/**
 * Component palette for the shop builder
 * Uses the component registry for metadata and default configs
 */
export default function ComponentPalette({ onSelectComponent }: ComponentPaletteProps) {
    const componentTypes = getAllComponentTypes();

    return (
        <div className="w-64 bg-content1 border-r border-divider p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">thành phần</h3>
            <div className="space-y-2">
                {componentTypes.map((type) => {
                    const meta = COMPONENT_REGISTRY[type];
                    const Icon = meta.icon;

                    return (
                        <Card
                            key={type}
                            isPressable
                            onPress={() => onSelectComponent(type, meta.defaultConfig)}
                            className="hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <CardBody className="p-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm capitalize">
                                            {meta.label}
                                        </h4>
                                        <p className="text-xs text-default-500">
                                            {meta.description}
                                        </p>
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

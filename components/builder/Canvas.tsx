"use client";
"use client";

import { ComponentType } from "@prisma/client";
import ShopComponentWrapper from "@/components/shop/ShopComponentWrapper";
import { ComponentConfig, ShopComponentData } from "@/types/shop";
import { Button } from "@heroui/button";
import { Trash2, ChevronsUpDown } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BuilderCanvasProps {
    components: ShopComponentData[];
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
    onDeleteComponent: (id: string) => void;
    onReorderComponents: (components: ShopComponentData[]) => void;
}

function SortableComponent({
    component,
    isSelected,
    onSelect,
    onDelete,
}: {
    component: ShopComponentData;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Component Controls */}
            <div className="absolute -left-16 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2">
                <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                    radius="none"
                >
                    <ChevronsUpDown />
                </Button>
                <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={onDelete}
                    radius="none"
                >
                    <Trash2 />
                </Button>
            </div>

            {/* Component */}
            <ShopComponentWrapper
                type={component.type}
                config={component.config}
                isBuilder
                onSelect={onSelect}
                isSelected={isSelected}
            />
        </div>
    );
}

export default function BuilderCanvas({
    components,
    selectedComponentId,
    onSelectComponent,
    onDeleteComponent,
    onReorderComponents,
}: BuilderCanvasProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = components.findIndex((c) => c.id === active.id);
            const newIndex = components.findIndex((c) => c.id === over.id);

            const reordered = arrayMove(components, oldIndex, newIndex).map(
                (comp, index) => ({
                    ...comp,
                    order: index,
                })
            );

            onReorderComponents(reordered);
        }
    };

    if (components.length === 0) {
        return (
            <div className="flex-1 bg-background p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="border-2 border-dashed border-default-300 rounded-lg p-12 text-center">
                        <h3 className="text-xl font-semibold text-default-500 mb-2">
                            Start Building Your Shop
                        </h3>
                        <p className="text-default-400">
                            Select a component from the left to add it to your shop
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-4 pl-16">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={components.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {components.map((component) => (
                            <SortableComponent
                                key={component.id}
                                component={component}
                                isSelected={selectedComponentId === component.id}
                                onSelect={() => onSelectComponent(component.id)}
                                onDelete={() => onDeleteComponent(component.id)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

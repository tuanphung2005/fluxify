"use client";

import { useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { m, LazyMotion, domAnimation, AnimatePresence } from "framer-motion";

import ShopComponentWrapper from "@/components/shop/ShopComponentWrapper";
import { ShopComponentData } from "@/types/shop";

interface BuilderCanvasProps {
  components: ShopComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onReorderComponents: (components: ShopComponentData[]) => void;
}

function CanvasComponent({
  component,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  component: ShopComponentData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <m.div
      layout
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      {/* Component Controls */}
      <div className="absolute left-full top-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col gap-1 ml-0.5">
        <Button
          isIconOnly
          isDisabled={isFirst}
          size="sm"
          variant="flat"
          onPress={onMoveUp}
        >
          <ChevronUp />
        </Button>
        <Button
          isIconOnly
          isDisabled={isLast}
          size="sm"
          variant="flat"
          onPress={onMoveDown}
        >
          <ChevronDown />
        </Button>
        <Button
          isIconOnly
          color="danger"
          size="sm"
          variant="flat"
          onPress={onDelete}
        >
          <Trash2 />
        </Button>
      </div>

      {/* Component */}
      <ShopComponentWrapper
        isBuilder
        config={component.config}
        isSelected={isSelected}
        type={component.type}
        onSelect={onSelect}
      />
    </m.div>
  );
}

export default function BuilderCanvas({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onReorderComponents,
}: BuilderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevComponentsLengthRef = useRef(components.length);

  // Auto-scroll to bottom when a new component is added
  useEffect(() => {
    if (components.length > prevComponentsLengthRef.current) {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    prevComponentsLengthRef.current = components.length;
  }, [components.length]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newComponents = [...components];
    [newComponents[index - 1], newComponents[index]] = [
      newComponents[index],
      newComponents[index - 1],
    ];
    const reordered = newComponents.map((comp, i) => ({
      ...comp,
      order: i,
    }));
    onReorderComponents(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === components.length - 1) return;
    const newComponents = [...components];
    [newComponents[index], newComponents[index + 1]] = [
      newComponents[index + 1],
      newComponents[index],
    ];
    const reordered = newComponents.map((comp, i) => ({
      ...comp,
      order: i,
    }));
    onReorderComponents(reordered);
  };

  if (components.length === 0) {
    return (
      <div className="flex-1 bg-background p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="border-2 border-dashed border-default-300 rounded-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-default-500 mb-2">
              Bắt đầu xây dựng cửa hàng
            </h3>
            <p className="text-default-400">
              Chọn một thành phần từ bên trái để thêm vào cửa hàng của bạn
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-background p-8 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto space-y-4">
        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="popLayout">
            {components.map((component, index) => (
              <CanvasComponent
                key={component.id}
                component={component}
                isFirst={index === 0}
                isLast={index === components.length - 1}
                isSelected={selectedComponentId === component.id}
                onDelete={() => onDeleteComponent(component.id)}
                onMoveDown={() => handleMoveDown(index)}
                onMoveUp={() => handleMoveUp(index)}
                onSelect={() => onSelectComponent(component.id)}
              />
            ))}
          </AnimatePresence>
        </LazyMotion>
      </div>
    </div>
  );
}

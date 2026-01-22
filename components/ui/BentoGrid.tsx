"use client";

import { ReactNode } from "react";
import clsx from "clsx";

import { GRID_COLUMNS, GAP_SIZES, GridColumns, GapSize } from "@/lib/ui/tokens";

interface BentoGridProps {
  children: ReactNode;
  columns?: GridColumns;
  gap?: GapSize;
  className?: string;
}

/**
 * BentoGrid - A flexible grid container for bento box layouts
 *
 * @example
 * ```tsx
 * <BentoGrid columns={3} gap="md">
 *   <BentoCard size="lg">Chart</BentoCard>
 *   <BentoCard size="sm">Stats 1</BentoCard>
 *   <BentoCard size="sm">Stats 2</BentoCard>
 * </BentoGrid>
 * ```
 */
export default function BentoGrid({
  children,
  columns = 3,
  gap = "md",
  className,
}: BentoGridProps) {
  return (
    <div
      className={clsx("grid", GRID_COLUMNS[columns], GAP_SIZES[gap], className)}
    >
      {children}
    </div>
  );
}

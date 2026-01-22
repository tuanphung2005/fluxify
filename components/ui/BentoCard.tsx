"use client";

import { ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

import {
  BENTO_SIZES,
  STATS_COLORS,
  BentoSize,
  StatsColor,
} from "@/lib/ui/tokens";

interface BentoCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: BentoSize;
  variant?: "default" | "stats" | "glass";
  color?: StatsColor;
  className?: string;
  headerAction?: ReactNode;
}

/**
 * BentoCard - A versatile card component for bento box layouts
 *
 * Variants:
 * - default: Standard card with optional title/subtitle
 * - stats: Stats card with icon, value, and trend indicator
 * - glass: Glassmorphism style card
 *
 * @example
 * ```tsx
 * <BentoCard size="sm" variant="stats" icon={DollarSign} color="success" title="Revenue">
 *   $12,345
 * </BentoCard>
 * ```
 */
export default function BentoCard({
  children,
  title,
  subtitle,
  icon: Icon,
  size = "sm",
  variant = "default",
  color = "primary",
  className,
  headerAction,
}: BentoCardProps) {
  const sizeClass = BENTO_SIZES[size];

  if (variant === "stats") {
    return (
      <Card className={clsx("border-none shadow-md", sizeClass, className)}>
        <CardBody className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {title && (
                <p className="text-sm font-medium text-default-600 uppercase tracking-wider">
                  {title}
                </p>
              )}
              <div className="text-4xl font-bold mt-2">{children}</div>
            </div>
            {Icon && (
              <div className={clsx("p-3 rounded-xl", STATS_COLORS[color])}>
                <Icon size={24} />
              </div>
            )}
          </div>
          {subtitle && (
            <div className="mt-4 text-sm text-default-400">{subtitle}</div>
          )}
        </CardBody>
      </Card>
    );
  }

  if (variant === "glass") {
    return (
      <Card
        className={clsx(
          "border-none shadow-lg bg-content1/80 backdrop-blur-md",
          sizeClass,
          className,
        )}
      >
        {(title || headerAction) && (
          <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {subtitle && (
                <p className="text-sm text-default-500">{subtitle}</p>
              )}
            </div>
            {headerAction}
          </CardHeader>
        )}
        <CardBody className="p-6">{children}</CardBody>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={clsx("border-none shadow-md", sizeClass, className)}>
      {(title || headerAction) && (
        <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={clsx("p-2 rounded-lg", STATS_COLORS[color])}>
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {subtitle && (
                <p className="text-sm text-default-500">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction}
        </CardHeader>
      )}
      <CardBody className="p-6">{children}</CardBody>
    </Card>
  );
}

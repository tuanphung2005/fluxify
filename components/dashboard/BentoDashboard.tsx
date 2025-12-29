"use client";

import { ReactNode } from "react";
import { LucideIcon, Package } from "lucide-react";
import BentoGrid from "@/components/ui/BentoGrid";
import BentoCard from "@/components/ui/BentoCard";
import { BentoSize, StatsColor, GridColumns } from "@/lib/ui/tokens";

// =============================================================================
// WIDGET TYPES
// =============================================================================

export interface StatsWidget {
    id: string;
    type: "stats";
    size?: BentoSize;
    title: string;
    value: string | number;
    icon?: LucideIcon;
    color?: StatsColor;
    subtext?: ReactNode;
    className?: string;
}

export interface ChartWidget {
    id: string;
    type: "chart";
    size?: BentoSize;
    title?: string;
    children: ReactNode;
    headerAction?: ReactNode;
    className?: string;
}

export interface ListWidget {
    id: string;
    type: "list";
    size?: BentoSize;
    title: string;
    items: Array<{
        id: string;
        icon?: LucideIcon;
        iconColor?: string;
        primary: ReactNode;
        secondary?: ReactNode;
        trailing?: ReactNode;
    }>;
    emptyIcon?: LucideIcon;
    emptyMessage?: string;
    className?: string;
}

export interface CustomWidget {
    id: string;
    type: "custom";
    size?: BentoSize;
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    color?: StatsColor;
    variant?: "default" | "stats" | "glass";
    headerAction?: ReactNode;
    children: ReactNode;
    className?: string;
}

export type DashboardWidget = StatsWidget | ChartWidget | ListWidget | CustomWidget;

// =============================================================================
// BENTO DASHBOARD PROPS
// =============================================================================

export interface BentoDashboardProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    widgets: DashboardWidget[];
    columns?: GridColumns;
    className?: string;
}

// =============================================================================
// WIDGET RENDERERS
// =============================================================================

function renderStatsWidget(widget: StatsWidget) {
    return (
        <BentoCard
            key={widget.id}
            size={widget.size ?? "sm"}
            variant="stats"
            title={widget.title}
            icon={widget.icon}
            color={widget.color ?? "primary"}
            subtitle={widget.subtext as string | undefined}
            className={widget.className}
        >
            {widget.value}
        </BentoCard>
    );
}

function renderChartWidget(widget: ChartWidget) {
    return (
        <BentoCard
            key={widget.id}
            size={widget.size ?? "lg"}
            title={widget.title}
            headerAction={widget.headerAction}
            className={widget.className}
        >
            {widget.children}
        </BentoCard>
    );
}

function renderListWidget(widget: ListWidget) {
    const EmptyIcon = widget.emptyIcon ?? Package;

    return (
        <BentoCard
            key={widget.id}
            size={widget.size ?? "md"}
            title={widget.title}
            className={widget.className}
        >
            {widget.items.length > 0 ? (
                <div className="space-y-4">
                    {widget.items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between border-b border-divider last:border-0 pb-3 last:pb-0"
                            >
                                <div className="flex items-center gap-3">
                                    {Icon && (
                                        <div
                                            className={`p-2 rounded-lg ${item.iconColor ?? "bg-primary/10 text-primary"}`}
                                        >
                                            <Icon size={16} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{item.primary}</p>
                                        {item.secondary && (
                                            <p className="text-xs text-default-400">
                                                {item.secondary}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {item.trailing && (
                                    <span className="text-sm font-bold">{item.trailing}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-default-400">
                    <div className="p-4 bg-default-100 rounded-full mb-3">
                        <EmptyIcon size={24} />
                    </div>
                    <p>{widget.emptyMessage ?? "No items"}</p>
                </div>
            )}
        </BentoCard>
    );
}

function renderCustomWidget(widget: CustomWidget) {
    return (
        <BentoCard
            key={widget.id}
            size={widget.size ?? "sm"}
            title={widget.title}
            subtitle={widget.subtitle}
            icon={widget.icon}
            color={widget.color}
            variant={widget.variant ?? "default"}
            headerAction={widget.headerAction}
            className={widget.className}
        >
            {widget.children}
        </BentoCard>
    );
}

function renderWidget(widget: DashboardWidget): ReactNode {
    switch (widget.type) {
        case "stats":
            return renderStatsWidget(widget);
        case "chart":
            return renderChartWidget(widget);
        case "list":
            return renderListWidget(widget);
        case "custom":
            return renderCustomWidget(widget);
        default:
            return null;
    }
}

// =============================================================================
// BENTO DASHBOARD COMPONENT
// =============================================================================

/**
 * BentoDashboard - Unified dashboard component with bento grid layout
 * 
 * Supports multiple widget types:
 * - stats: Statistics cards with icon, value, and trend
 * - chart: Chart/visualization containers
 * - list: Activity lists with items
 * - custom: Fully customizable cards
 * 
 * @example
 * ```tsx
 * <BentoDashboard
 *   title="Dashboard"
 *   widgets={[
 *     { id: "sales", type: "stats", title: "Sales", value: 1234, icon: Package },
 *     { id: "chart", type: "chart", size: "lg", children: <MyChart /> },
 *     { id: "activity", type: "list", title: "Recent", items: [...] },
 *   ]}
 * />
 * ```
 */
export default function BentoDashboard({
    title,
    subtitle,
    actions,
    widgets,
    columns = 3,
    className,
}: BentoDashboardProps) {
    return (
        <div className={`space-y-8 p-6 ${className ?? ""}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                    {subtitle && (
                        <p className="text-default-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>

            {/* Widgets Grid */}
            <BentoGrid columns={columns} gap="md">
                {widgets.map((widget) => renderWidget(widget))}
            </BentoGrid>
        </div>
    );
}

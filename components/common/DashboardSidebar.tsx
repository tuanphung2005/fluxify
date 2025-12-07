"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { LucideIcon } from "lucide-react";

export interface SidebarMenuItem {
    key: string;
    label: string;
    icon: LucideIcon;
    path: string;
}

interface DashboardSidebarProps {
    menuItems: SidebarMenuItem[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export default function DashboardSidebar({ menuItems, header, footer, className = "" }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className={`w-64 h-[calc(100vh-64px)] bg-content1 border-r border-divider flex flex-col fixed left-0 top-16 z-50 ${className}`}>
            {header && (
                <div className="p-6 flex items-center gap-3 border-b border-divider">
                    {header}
                </div>
            )}

            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Button
                            key={item.key}
                            variant={isActive ? "flat" : "light"}
                            color={isActive ? "primary" : "default"}
                            className={`w-full justify-start ${isActive ? "font-semibold" : "text-default-500"}`}
                            startContent={<Icon size={20} />}
                            onPress={() => router.push(item.path)}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </div>

            {footer && (
                <div className="p-4 border-t border-divider space-y-2">
                    {footer}
                </div>
            )}
        </div>
    );
}

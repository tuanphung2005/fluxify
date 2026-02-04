"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { LucideIcon } from "lucide-react";

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number; // Optional badge for notifications (e.g., unread messages)
}

interface DashboardSidebarProps {
  menuItems: SidebarMenuItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function DashboardSidebar({
  menuItems,
  header,
  footer,
  className = "",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={`w-64 h-[calc(100vh-64px)] bg-content1 border-r border-divider flex flex-col fixed left-0 top-16 z-50 ${className}`}
    >
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
              className={`w-full justify-start ${isActive ? "font-semibold" : "text-default-500"}`}
              color={isActive ? "primary" : "default"}
              startContent={<Icon size={20} />}
              endContent={
                item.badge && item.badge > 0 ? (
                  <span className="ml-auto bg-danger text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null
              }
              variant={isActive ? "flat" : "light"}
              onPress={() => router.push(item.path)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      {footer && (
        <div className="p-4 border-t border-divider space-y-2">{footer}</div>
      )}
    </div>
  );
}

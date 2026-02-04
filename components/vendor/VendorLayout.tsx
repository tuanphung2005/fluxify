"use client";

import type { SidebarMenuItem } from "@/components/common/DashboardSidebar";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  CreditCard,
  MessageCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const BASE_MENU_ITEMS: Omit<SidebarMenuItem, "badge">[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/vendor",
  },
  {
    key: "products",
    label: "Sản phẩm",
    icon: Package,
    path: "/vendor/products",
  },
  {
    key: "orders",
    label: "Đơn hàng",
    icon: ShoppingBag,
    path: "/vendor/orders",
  },
  { key: "chat", label: "Tin nhắn", icon: MessageCircle, path: "/vendor/chat" },
  {
    key: "builder",
    label: "Thiết kế cửa hàng",
    icon: Store,
    path: "/vendor/shop-builder",
  },
  {
    key: "payment",
    label: "Cài đặt thanh toán",
    icon: CreditCard,
    path: "/vendor/payment",
  },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { unreadCount } = useUnreadMessages({ role: "vendor" });

  // Add badge to chat menu item
  const menuItems: SidebarMenuItem[] = BASE_MENU_ITEMS.map((item) => ({
    ...item,
    badge: item.key === "chat" ? unreadCount : undefined,
  }));

  return (
    <DashboardLayout
      menuItems={menuItems}
      requiredRole="VENDOR"
      showLogout={false}
    >
      {children}
    </DashboardLayout>
  );
}

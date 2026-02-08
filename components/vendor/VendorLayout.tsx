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
import { useNewOrders } from "@/hooks/useNewOrders";

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
  const { newOrdersCount } = useNewOrders();

  // Add badge to chat and orders menu items
  const menuItems: SidebarMenuItem[] = BASE_MENU_ITEMS.map((item) => {
    if (item.key === "chat") {
      return { ...item, badge: unreadCount };
    }
    if (item.key === "orders") {
      return { ...item, badge: newOrdersCount };
    }
    return item;
  });

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

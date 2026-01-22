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

const VENDOR_MENU_ITEMS: SidebarMenuItem[] = [
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
  return (
    <DashboardLayout
      menuItems={VENDOR_MENU_ITEMS}
      requiredRole="VENDOR"
      showLogout={false}
    >
      {children}
    </DashboardLayout>
  );
}

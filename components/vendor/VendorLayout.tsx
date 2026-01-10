"use client";

import { LayoutDashboard, Package, ShoppingBag, Store, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import type { SidebarMenuItem } from "@/components/common/DashboardSidebar";

const VENDOR_MENU_ITEMS: SidebarMenuItem[] = [
    { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, path: "/vendor" },
    { key: "products", label: "Sản phẩm", icon: Package, path: "/vendor/products" },
    { key: "orders", label: "Đơn hàng", icon: ShoppingBag, path: "/vendor/orders" },
    { key: "builder", label: "Thiết kế cửa hàng", icon: Store, path: "/vendor/shop-builder" },
    { key: "payment", label: "Cài đặt thanh toán", icon: CreditCard, path: "/vendor/payment" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout
            requiredRole="VENDOR"
            menuItems={VENDOR_MENU_ITEMS}
            showLogout={false}
        >
            {children}
        </DashboardLayout>
    );
}

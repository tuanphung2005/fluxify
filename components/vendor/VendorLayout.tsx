"use client";

import { LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import type { SidebarMenuItem } from "@/components/common/DashboardSidebar";

const VENDOR_MENU_ITEMS: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/vendor" },
    { key: "products", label: "Products", icon: Package, path: "/vendor/products" },
    { key: "orders", label: "Orders", icon: ShoppingBag, path: "/vendor/orders" },
    { key: "builder", label: "Shop Builder", icon: Store, path: "/vendor/shop-builder" },
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

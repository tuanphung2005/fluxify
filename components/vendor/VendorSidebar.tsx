"use client";

import { Button } from "@heroui/button";
import { LayoutDashboard, Package, ShoppingBag, Settings, Store } from "lucide-react";
import DashboardSidebar from "@/components/common/DashboardSidebar";

export default function VendorSidebar() {
    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/vendor" },
        { key: "products", label: "Products", icon: Package, path: "/vendor/products" },
        { key: "orders", label: "Orders", icon: ShoppingBag, path: "/vendor/orders" },
        { key: "builder", label: "Shop Builder", icon: Store, path: "/vendor/shop-builder" },
    ];

    const footer = (
        <Button
            variant="light"
            className="w-full justify-start text-default-500"
            startContent={<Settings size={20} />}
        >
            Settings
        </Button>
    );

    return (
        <DashboardSidebar
            menuItems={menuItems}
            footer={footer}
        />
    );
}

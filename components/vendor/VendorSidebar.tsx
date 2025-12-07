"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { LayoutDashboard, Package, ShoppingBag, Settings, Store } from "lucide-react";

export default function VendorSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/vendor" },
        { key: "products", label: "Products", icon: Package, path: "/vendor/products" }, // Assuming we'll split these out
        { key: "orders", label: "Orders", icon: ShoppingBag, path: "/vendor/orders" },
        { key: "builder", label: "Shop Builder", icon: Store, path: "/vendor/shop-builder" },
    ];

    return (
        <div className="w-64 h-[calc(100vh-64px)] bg-content1 border-r border-divider flex flex-col fixed left-0 top-16 z-50">
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

            <div className="p-4 border-t border-divider">
                <Button
                    variant="light"
                    className="w-full justify-start text-default-500"
                    startContent={<Settings size={20} />}
                >
                    Settings
                </Button>
            </div>
        </div>
    );
}

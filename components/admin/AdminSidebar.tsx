"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { LayoutDashboard, Users, ShoppingBag, LogOut, Settings } from "lucide-react";
import { Image as HeroUIImage } from "@heroui/image";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { key: "users", label: "Users", icon: Users, path: "/admin/users" },
        { key: "shops", label: "Shops", icon: ShoppingBag, path: "/admin/shops" },
    ];

    const handleLogout = () => {
        signOut({ callbackUrl: "/auth/login" });
    };

    return (
        <div className="w-64 h-screen bg-content1 border-r border-divider flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-3 border-b border-divider">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">F</span>
                </div>
                <span className="font-bold text-lg">Fluxify Admin</span>
            </div>

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

            <div className="p-4 border-t border-divider space-y-2">
                <Button
                    variant="light"
                    className="w-full justify-start text-default-500"
                    startContent={<Settings size={20} />}
                >
                    Settings
                </Button>
                <Button
                    variant="light"
                    color="danger"
                    className="w-full justify-start"
                    startContent={<LogOut size={20} />}
                    onPress={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}

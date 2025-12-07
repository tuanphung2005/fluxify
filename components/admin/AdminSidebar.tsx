"use client";

import { Button } from "@heroui/button";
import { LayoutDashboard, Users, ShoppingBag, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import DashboardSidebar from "@/components/common/DashboardSidebar";

export default function AdminSidebar() {
    const menuItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { key: "users", label: "Users", icon: Users, path: "/admin/users" },
        { key: "shops", label: "Shops", icon: ShoppingBag, path: "/admin/shops" },
    ];

    const handleLogout = () => {
        signOut({ callbackUrl: "/auth/login" });
    };

    const header = (
        <>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-lg">Fluxify Admin</span>
        </>
    );

    const footer = (
        <>
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
        </>
    );

    return (
        <DashboardSidebar
            menuItems={menuItems}
            header={header}
            footer={footer}
        />
    );
}

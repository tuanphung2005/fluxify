"use client";

import { LayoutDashboard, Users, ShoppingBag } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import type { SidebarMenuItem } from "@/components/common/DashboardSidebar";

const ADMIN_MENU_ITEMS: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { key: "users", label: "Users", icon: Users, path: "/admin/users" },
    { key: "shops", label: "Shops", icon: ShoppingBag, path: "/admin/shops" },
];

const AdminSidebarHeader = () => (
    <>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
        </div>
        <span className="font-bold text-lg">Fluxify Admin</span>
    </>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout
            requiredRole="ADMIN"
            menuItems={ADMIN_MENU_ITEMS}
            sidebarHeader={<AdminSidebarHeader />}
            showLogout={true}
            showSettings={true}
        >
            {children}
        </DashboardLayout>
    );
}

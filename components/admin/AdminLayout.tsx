"use client";

import type { SidebarMenuItem } from "@/components/common/DashboardSidebar";

import { LayoutDashboard, Users, ShoppingBag } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard";

const ADMIN_MENU_ITEMS: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      requiredRole="ADMIN"
      showLogout={true}
      showSettings={true}
      sidebarHeader={<AdminSidebarHeader />}
    >
      {children}
    </DashboardLayout>
  );
}

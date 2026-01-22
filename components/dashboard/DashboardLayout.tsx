"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/DashboardSidebar";

// =============================================================================
// TYPES
// =============================================================================

type UserRole = "ADMIN" | "VENDOR" | "USER";

interface DashboardLayoutProps {
  children: ReactNode;
  /** Required role to access this dashboard */
  requiredRole?: UserRole;
  /** Menu items for the sidebar */
  menuItems: SidebarMenuItem[];
  /** Custom header for sidebar (optional) */
  sidebarHeader?: ReactNode;
  /** Show logout button in footer */
  showLogout?: boolean;
  /** Show settings button in footer */
  showSettings?: boolean;
  /** Redirect path when unauthorized */
  unauthorizedRedirect?: string;
  /** Redirect path for login */
  loginRedirect?: string;
}

// =============================================================================
// DASHBOARD LAYOUT COMPONENT
// =============================================================================

/**
 * Unified dashboard layout for Admin and Vendor dashboards
 *
 * Features:
 * - Role-based access control
 * - Configurable sidebar menu
 * - Loading states
 * - Logout/Settings footer options
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   requiredRole="ADMIN"
 *   menuItems={[
 *     { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
 *   ]}
 * >
 *   <YourContent />
 * </DashboardLayout>
 * ```
 */
export default function DashboardLayout({
  children,
  requiredRole,
  menuItems,
  sidebarHeader,
  showLogout = true,
  showSettings = true,
  unauthorizedRedirect = "/",
  loginRedirect = "/auth/login",
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Helper to check if user has required role (ADMIN can access VENDOR features)
  const hasRequiredRole = (
    userRole: string | undefined,
    required: UserRole | undefined,
  ) => {
    if (!required) return true;
    if (userRole === "ADMIN") return true; // ADMIN can access everything

    return userRole === required;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(loginRedirect);
    } else if (
      status === "authenticated" &&
      requiredRole &&
      !hasRequiredRole(session?.user.role, requiredRole)
    ) {
      router.push(unauthorizedRedirect);
    }
  }, [
    status,
    session,
    router,
    requiredRole,
    unauthorizedRedirect,
    loginRedirect,
  ]);

  const handleLogout = () => {
    signOut({ callbackUrl: loginRedirect });
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show loading if role check fails (will redirect)
  if (
    requiredRole &&
    (!session || !hasRequiredRole(session.user.role, requiredRole))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Build footer
  const footer =
    showSettings || showLogout ? (
      <>
        {showSettings && (
          <Button
            className="w-full justify-start text-default-500"
            startContent={<Settings size={20} />}
            variant="light"
          >
            Cài đặt
          </Button>
        )}
        {showLogout && (
          <Button
            className="w-full justify-start"
            color="danger"
            startContent={<LogOut size={20} />}
            variant="light"
            onPress={handleLogout}
          >
            Đăng xuất
          </Button>
        )}
      </>
    ) : undefined;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-default-50 flex">
      <DashboardSidebar
        footer={footer}
        header={sidebarHeader}
        menuItems={menuItems}
      />
      <div className="flex-1 ml-64">
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Get preset menu items for vendor dashboard
 */
export function getVendorMenuItems(): SidebarMenuItem[] {
  // Import dynamically to avoid circular deps
  const {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Store,
  } = require("lucide-react");

  return [
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
    {
      key: "builder",
      label: "Thiết kế cửa hàng",
      icon: Store,
      path: "/vendor/shop-builder",
    },
  ];
}

/**
 * Get preset menu items for admin dashboard
 */
export function getAdminMenuItems(): SidebarMenuItem[] {
  const { LayoutDashboard, Users, ShoppingBag } = require("lucide-react");

  return [
    {
      key: "dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    { key: "users", label: "Người dùng", icon: Users, path: "/admin/users" },
    {
      key: "shops",
      label: "Cửa hàng",
      icon: ShoppingBag,
      path: "/admin/shops",
    },
  ];
}

/**
 * Get admin header component
 */
export function AdminSidebarHeader() {
  return (
    <>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-white font-bold">F</span>
      </div>
      <span className="font-bold text-lg">Fluxify Admin</span>
    </>
  );
}

"use client";

import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useDisclosure } from "@heroui/react";
import dynamic from "next/dynamic";

import { BentoDashboard, DashboardWidget } from "@/components/dashboard";
import ProductManager from "@/components/vendor/ProductManager";

const SalesChart = dynamic(
  () => import("@/components/vendor/SalesChart"),
  { ssr: false },
);

interface DashboardData {
  totalSales: number;
  pendingOrders: number;
  totalRevenue: number;
  chartData: { month: string; sales: number }[];
  recentActivity: Array<{
    id: string;
    price: number;
    product: { name: string };
    order: { createdAt: Date };
  }>;
}

export default function VendorDashboard({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const productModal = useDisclosure();

  const widgets: DashboardWidget[] = [
    // Stats Row
    {
      id: "total-sales",
      type: "stats",
      size: "sm",
      title: "Tổng doanh số",
      value: initialData.totalSales.toString(),
      icon: Package,
      color: "primary",
      subtext: (
        <div className="flex items-center text-success font-medium">
          <TrendingUp className="mr-1" size={16} />
          <span>số đơn hàng</span>
        </div>
      ),
      className: "bg-gradient-to-br from-primary-50 to-background",
    },
    {
      id: "pending-orders",
      type: "stats",
      size: "sm",
      title: "Đơn chờ xử lý",
      value: initialData.pendingOrders.toString(),
      icon: ShoppingCart,
      color: "warning",
      subtext: "Đơn cần giao" as unknown as React.ReactNode,
    },
    {
      id: "total-revenue",
      type: "stats",
      size: "sm",
      title: "Tổng doanh thu",
      value: `${initialData.totalRevenue.toLocaleString()} ₫`,
      icon: DollarSign,
      color: "success",
      subtext: "Tổng thu nhập" as unknown as React.ReactNode,
    },
    // Chart - spans 2 columns
    {
      id: "sales-chart",
      type: "chart",
      size: "lg",
      children: <SalesChart data={initialData.chartData} />,
    },
    // Recent Activity List
    {
      id: "recent-activity",
      type: "list",
      size: "md",
      title: "Hoạt động gần đây",
      items: initialData.recentActivity.map((item) => ({
        id: item.id,
        icon: ShoppingCart,
        iconColor: "bg-primary/10 text-primary",
        primary: `Đơn hàng mới: ${item.product.name}`,
        secondary: new Date(item.order.createdAt).toLocaleDateString(),
        trailing: `${Number(item.price).toFixed(2)} ₫`,
      })),
      emptyIcon: Package,
      emptyMessage: "Chưa có hoạt động nào",
    },
  ];

  return (
    <>
      <BentoDashboard columns={3} title="Tổng quan" widgets={widgets} />
      <ProductManager
        isOpen={productModal.isOpen}
        onOpenChange={productModal.onOpenChange}
        onProductsChange={() => {
          window.location.reload();
        }}
      />
    </>
  );
}

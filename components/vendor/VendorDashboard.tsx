"use client";

import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useDisclosure } from "@heroui/react";
import { BentoDashboard, DashboardWidget } from "@/components/dashboard";
import SalesChart from "@/components/vendor/SalesChart";
import ProductManager from "@/components/vendor/ProductManager";

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
            title: "Total Sales",
            value: initialData.totalSales.toString(),
            icon: Package,
            color: "primary",
            subtext: (
                <div className="flex items-center text-success font-medium">
                    <TrendingUp size={16} className="mr-1" />
                    <span>Orders count</span>
                </div>
            ),
            className: "bg-gradient-to-br from-primary-50 to-background",
        },
        {
            id: "pending-orders",
            type: "stats",
            size: "sm",
            title: "Pending Orders",
            value: initialData.pendingOrders.toString(),
            icon: ShoppingCart,
            color: "warning",
            subtext: "Orders to fulfill" as unknown as React.ReactNode,
        },
        {
            id: "total-revenue",
            type: "stats",
            size: "sm",
            title: "Total Revenue",
            value: `$${initialData.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "success",
            subtext: "Lifetime earnings" as unknown as React.ReactNode,
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
            title: "Recent Activity",
            items: initialData.recentActivity.map((item) => ({
                id: item.id,
                icon: ShoppingCart,
                iconColor: "bg-primary/10 text-primary",
                primary: `New order for ${item.product.name}`,
                secondary: new Date(item.order.createdAt).toLocaleDateString(),
                trailing: `$${Number(item.price).toFixed(2)}`,
            })),
            emptyIcon: Package,
            emptyMessage: "No recent activity",
        },
    ];

    return (
        <>
            <BentoDashboard title="Dashboard" widgets={widgets} columns={3} />
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

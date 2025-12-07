"use client"

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import StatsCard from "@/components/common/StatsCard";
import SalesChart from "@/components/vendor/SalesChart";
import { useDisclosure } from "@heroui/react";
import ProductManager from "@/components/vendor/ProductManager";

interface DashboardData {
    totalSales: number;
    pendingOrders: number;
    totalRevenue: number;
    chartData: any[];
    recentActivity: any[];
}

export default function VendorDashboard({ initialData }: { initialData: DashboardData }) {
    const productModal = useDisclosure();

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
            </div>

            <div className="space-y-8 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Sales"
                        value={initialData.totalSales.toString()}
                        icon={Package}
                        subtext={
                            <div className="flex items-center text-success font-medium">
                                <TrendingUp size={16} className="mr-1" />
                                <span>Orders count</span>
                            </div>
                        }
                        color="primary"
                        className="bg-gradient-to-br from-primary-50 to-background"
                    />

                    <StatsCard
                        title="Pending Orders"
                        value={initialData.pendingOrders.toString()}
                        icon={ShoppingCart}
                        subtext="Orders to fulfill"
                        color="warning"
                    />

                    <StatsCard
                        title="Total Revenue"
                        value={`$${initialData.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        subtext="Lifetime earnings"
                        color="success"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <SalesChart data={initialData.chartData} />
                    </div>
                    <div className="space-y-6">
                        <Card className="h-full border-none shadow-md">
                            <CardHeader className="px-6 py-4 border-b border-divider">
                                <h3 className="text-lg font-semibold">Recent Activity</h3>
                            </CardHeader>
                            <CardBody className="p-6">
                                {initialData.recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {initialData.recentActivity.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between border-b border-divider last:border-0 pb-3 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                        <ShoppingCart size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">New order for {item.product.name}</p>
                                                        <p className="text-xs text-default-400">{new Date(item.order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold">${Number(item.price).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center text-default-400">
                                        <div className="p-4 bg-default-100 rounded-full mb-3">
                                            <Package size={24} />
                                        </div>
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            <ProductManager
                isOpen={productModal.isOpen}
                onOpenChange={productModal.onOpenChange}
                onProductsChange={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Eye,
    Percent,
    Package,
    BarChart3
} from "lucide-react";
import { api } from "@/lib/api/api";
import StatsCard from "@/components/common/StatsCard";
import { DashboardStatsSkeleton, ChartSkeleton, TableSkeleton } from "@/components/common/Skeletons";
import type { ChartDataPoint, TopProductData } from "@/types/api";

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalViews: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueByDate: ChartDataPoint[];
    ordersByDate: ChartDataPoint[];
    topProducts: TopProductData[];
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [days, setDays] = useState("30");
    const [chartType, setChartType] = useState<"revenue" | "orders">("revenue");

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<AnalyticsData>(`/api/vendor/analytics?days=${days}`);
            setData(response);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("en-US").format(value);
    };

    // Simple bar chart component
    const SimpleBarChart = ({ data: chartData }: { data: ChartDataPoint[] }) => {
        const maxValue = Math.max(...chartData.map(d => d.value), 1);

        return (
            <div className="flex items-end gap-1 h-48">
                {chartData.map((point, index) => (
                    <div
                        key={index}
                        className="flex-1 group relative"
                    >
                        <div
                            className="bg-primary rounded-t transition-all duration-300 hover:bg-primary-600"
                            style={{ height: `${(point.value / maxValue) * 100}%` }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                            {point.date}: {chartType === "revenue" ? formatCurrency(point.value) : point.value}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-8 p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Analytics</h2>
                </div>
                <DashboardStatsSkeleton />
                <ChartSkeleton />
                <TableSkeleton rows={5} cols={4} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12 text-default-500">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Failed to load analytics data</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics</h2>
                <Select
                    aria-label="Time range"
                    size="sm"
                    selectedKeys={[days]}
                    onSelectionChange={(keys) => setDays(Array.from(keys)[0] as string)}
                    className="w-40"
                >
                    <SelectItem key="7">Last 7 days</SelectItem>
                    <SelectItem key="30">Last 30 days</SelectItem>
                    <SelectItem key="90">Last 90 days</SelectItem>
                </Select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(data.totalRevenue)}
                    icon={DollarSign}
                    subtext={
                        <div className="flex items-center text-success">
                            <TrendingUp size={14} className="mr-1" />
                            <span>{days} day total</span>
                        </div>
                    }
                    color="success"
                />
                <StatsCard
                    title="Orders"
                    value={formatNumber(data.totalOrders)}
                    icon={ShoppingCart}
                    subtext="Total orders"
                    color="primary"
                />
                <StatsCard
                    title="Product Views"
                    value={formatNumber(data.totalViews)}
                    icon={Eye}
                    subtext="All-time views"
                    color="secondary"
                />
                <StatsCard
                    title="Conversion Rate"
                    value={`${data.conversionRate}%`}
                    icon={Percent}
                    subtext={`Avg order: ${formatCurrency(data.averageOrderValue)}`}
                    color="warning"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Tabs
                            selectedKey={chartType}
                            onSelectionChange={(key) => setChartType(key as "revenue" | "orders")}
                        >
                            <Tab key="revenue" title="Revenue" />
                            <Tab key="orders" title="Orders" />
                        </Tabs>
                    </CardHeader>
                    <CardBody>
                        <SimpleBarChart
                            data={chartType === "revenue" ? data.revenueByDate : data.ordersByDate}
                        />
                        <div className="flex justify-between mt-4 text-xs text-default-400">
                            <span>{data.revenueByDate[0]?.date}</span>
                            <span>{data.revenueByDate[data.revenueByDate.length - 1]?.date}</span>
                        </div>
                    </CardBody>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold">Top Products</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        {data.topProducts.length === 0 ? (
                            <div className="text-center py-8 text-default-400">
                                <Package size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No sales data yet</p>
                            </div>
                        ) : (
                            data.topProducts.map((item, index) => (
                                <div key={item.product.id} className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-default-400 w-6">
                                        {index + 1}
                                    </span>
                                    {item.product.images?.[0] ? (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-default-100 rounded flex items-center justify-center">
                                            <Package size={16} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.product.name}</p>
                                        <p className="text-xs text-default-400">
                                            {item.totalSold} sold · {formatCurrency(item.totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

"use client";

import type { ChartDataPoint, TopProductData } from "@/types/api";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Eye,
  Percent,
  Package,
  BarChart3,
} from "lucide-react";

import { api } from "@/lib/api/api";
import StatsCard from "@/components/common/StatsCard";
import {
  DashboardStatsSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "@/components/common/Skeletons";

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

const formatCurrencyUSD = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

function SimpleBarChart({
  data: chartData,
  chartType,
}: {
  data: ChartDataPoint[];
  chartType: "revenue" | "orders";
}) {
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-1 h-48">
      {chartData.map((point) => (
        <div key={point.date} className="flex-1 group relative">
          <div
            className="bg-primary rounded-t transition-all duration-300 hover:bg-primary-600"
            style={{ height: `${(point.value / maxValue) * 100}%` }}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
            {point.date}:{" "}
            {chartType === "revenue"
              ? formatCurrencyUSD(point.value)
              : point.value}
          </div>
        </div>
      ))}
    </div>
  );
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
      const response = await api.get<AnalyticsData>(
        `/api/vendor/analytics?days=${days}`,
      );

      setData(response);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Thống kê</h2>
        </div>
        <DashboardStatsSkeleton />
        <ChartSkeleton />
        <TableSkeleton cols={4} rows={5} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-default-500">
        <BarChart3 className="mx-auto mb-4 opacity-50" size={48} />
        <p>Không thể tải dữ liệu thống kê</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê</h2>
        <Select
          aria-label="Time range"
          className="w-40"
          selectedKeys={[days]}
          size="sm"
          onSelectionChange={(keys) => setDays(Array.from(keys)[0] as string)}
        >
          <SelectItem key="7">7 ngày qua</SelectItem>
          <SelectItem key="30">30 ngày qua</SelectItem>
          <SelectItem key="90">90 ngày qua</SelectItem>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          color="success"
          icon={DollarSign}
          subtext={
            <div className="flex items-center text-success">
              <TrendingUp className="mr-1" size={14} />
              <span>Tổng {days} ngày</span>
            </div>
          }
          title="Total Revenue"
          value={formatCurrencyUSD(data.totalRevenue)}
        />
        <StatsCard
          color="primary"
          icon={ShoppingCart}
          subtext="Tổng đơn hàng"
          title="Đơn hàng"
          value={formatNumber(data.totalOrders)}
        />
        <StatsCard
          color="secondary"
          icon={Eye}
          subtext="Tổng lượt xem"
          title="Lượt xem"
          value={formatNumber(data.totalViews)}
        />
        <StatsCard
          color="warning"
          icon={Percent}
          subtext={`Trung bình: ${formatCurrencyUSD(data.averageOrderValue)}`}
          title="Tỷ lệ chuyển đổi"
          value={`${data.conversionRate}%`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs
              selectedKey={chartType}
              onSelectionChange={(key) =>
                setChartType(key as "revenue" | "orders")
              }
            >
              <Tab key="revenue" title="Doanh thu" />
              <Tab key="orders" title="Đơn hàng" />
            </Tabs>
          </CardHeader>
          <CardBody>
            <SimpleBarChart
              chartType={chartType}
              data={
                chartType === "revenue" ? data.revenueByDate : data.ordersByDate
              }
            />
            <div className="flex justify-between mt-4 text-xs text-default-400">
              <span>{data.revenueByDate[0]?.date}</span>
              <span>
                {data.revenueByDate[data.revenueByDate.length - 1]?.date}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Sản phẩm bán chạy</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {data.topProducts.length === 0 ? (
              <div className="text-center py-8 text-default-400">
                <Package className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm">Chưa có dữ liệu bán hàng</p>
              </div>
            ) : (
              data.topProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-default-400 w-6">
                    {index + 1}
                  </span>
                  {item.product.images?.[0] ? (
                    <Image
                      alt={item.product.name}
                      className="object-cover rounded"
                      height={40}
                      src={item.product.images[0]}
                      width={40}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-default-100 rounded flex items-center justify-center">
                      <Package size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-default-400">
                      {item.totalSold} đã bán ·{" "}
                      {formatCurrencyUSD(item.totalRevenue)}
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

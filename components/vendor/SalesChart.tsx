"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  month: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-content1 p-3 rounded-lg shadow-lg border border-divider">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-primary font-bold">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function SalesChart({ data }: SalesChartProps) {

  return (
    <Card className="w-full border-none shadow-md h-full">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h4 className="text-xl font-bold">Tổng quan doanh thu</h4>
        <p className="text-sm text-default-500">Hiệu suất thu nhập tháng</p>
      </CardHeader>
      <CardBody className="px-2 pb-2 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--heroui-primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--heroui-primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--heroui-default-200))"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--heroui-default-500))", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--heroui-default-500))", fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--heroui-primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{
                r: 6,
                fill: "hsl(var(--heroui-background))",
                stroke: "hsl(var(--heroui-primary))",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

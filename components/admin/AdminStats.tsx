"use client";

import { Card, CardBody } from "@heroui/card";
import { Users, ShoppingBag, Activity, DollarSign } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color?: "primary" | "secondary" | "success" | "warning";
}

function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
    }[color];

    return (
        <Card shadow="sm" className="border border-divider">
            <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className={`p-3 rounded-xl ${colorClasses}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-sm text-default-500 font-medium">{title}</p>
                    <h4 className="text-2xl font-bold mt-1">{value}</h4>
                    {trend && (
                        <p className="text-xs text-success font-medium mt-1">
                            {trend}
                        </p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default function AdminStats() {
    // Mock data for now, could fetch from API later
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total Users"
                value="1,234"
                icon={Users}
                trend="+12% this month"
                color="primary"
            />
            <StatCard
                title="Active Shops"
                value="56"
                icon={ShoppingBag}
                trend="+3 new today"
                color="secondary"
            />
            <StatCard
                title="Total Revenue"
                value="$45,678"
                icon={DollarSign}
                trend="+8% vs last month"
                color="success"
            />
            <StatCard
                title="System Status"
                value="Healthy"
                icon={Activity}
                color="warning"
            />
        </div>
    );
}

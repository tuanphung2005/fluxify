"use client";

import { Users, ShoppingBag, Activity, DollarSign } from "lucide-react";
import StatsCard from "@/components/common/StatsCard";

export default function AdminStats() {
    // Mock data for now, could fetch from API later
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
                title="Total Users"
                value="1,234"
                icon={Users}
                subtext={<span className="text-success font-medium">+12% this month</span>}
                color="primary"
                className="border border-divider"
            />
            <StatsCard
                title="Active Shops"
                value="56"
                icon={ShoppingBag}
                subtext={<span className="text-success font-medium">+3 new today</span>}
                color="secondary"
                className="border border-divider"
            />
            <StatsCard
                title="Total Revenue"
                value="$45,678"
                icon={DollarSign}
                subtext={<span className="text-success font-medium">+8% vs last month</span>}
                color="success"
                className="border border-divider"
            />
            <StatsCard
                title="System Status"
                value="Healthy"
                icon={Activity}
                color="warning"
                className="border border-divider"
            />
        </div>
    );
}

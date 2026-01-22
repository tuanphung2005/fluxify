"use client";

import { Users, ShoppingBag, Activity, DollarSign } from "lucide-react";

import StatsCard from "@/components/common/StatsCard";

export default function AdminStats() {
  // Mock data for now, could fetch from API later
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        className="border border-divider"
        color="primary"
        icon={Users}
        subtext={
          <span className="text-success font-medium">+12% this month</span>
        }
        title="Total Users"
        value="1,234"
      />
      <StatsCard
        className="border border-divider"
        color="secondary"
        icon={ShoppingBag}
        subtext={<span className="text-success font-medium">+3 new today</span>}
        title="Active Shops"
        value="56"
      />
      <StatsCard
        className="border border-divider"
        color="success"
        icon={DollarSign}
        subtext={
          <span className="text-success font-medium">+8% vs last month</span>
        }
        title="Total Revenue"
        value="$45,678"
      />
      <StatsCard
        className="border border-divider"
        color="warning"
        icon={Activity}
        title="System Status"
        value="Healthy"
      />
    </div>
  );
}

import type { Metadata } from "next";

import { redirect } from "next/navigation";

import AnalyticsDashboard from "@/components/vendor/AnalyticsDashboard";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Thống kê bán hàng",
  description: "Xem thống kê và phân tích bán hàng của bạn",
};

export default async function VendorAnalyticsPage() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "VENDOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/?modal=login");
  }

  return <AnalyticsDashboard />;
}

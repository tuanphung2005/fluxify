import type { Metadata } from "next";

import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  description: "Xem và quản lý đơn hàng của bạn",
};

import { auth } from "@/lib/auth";
import { Navbar } from "@/components/navbar/navbar";
import { PersonalDashboard } from "@/components/personal";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/?modal=login");
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-default-50">
        <PersonalDashboard />
      </main>
    </div>
  );
}

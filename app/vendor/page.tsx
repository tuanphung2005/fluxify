import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Edit, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import SalesChart from "@/components/vendor/SalesChart";
import VendorDashboard from "@/components/vendor/VendorDashboard";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VendorPage() {
  const auth = await getAuthenticatedVendor();
  if ('error' in auth) {
    redirect("/auth/login");
  }

  // 1. Get vendor products
  const products = await prisma.product.findMany({
    where: { vendorId: auth.vendor.id },
    select: { id: true }
  });
  const productIds = products.map(p => p.id);

  // 2. Get order items for these products (exclude cancelled orders)
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: {
        status: { not: 'CANCELLED' }
      }
    },
    include: {
      order: true,
      product: true
    },
    orderBy: { order: { createdAt: 'desc' } }
  });

  // 3. Calculate Metrics (cancelled orders already excluded from orderItems)
  const totalRevenue = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const uniqueOrderIds = new Set(orderItems.map(item => item.order.id));
  const totalSales = uniqueOrderIds.size;

  const pendingOrders = new Set(
    orderItems
      .filter(item => item.order.status === 'PENDING')
      .map(item => item.order.id)
  ).size;

  // 4. Prepare Chart Data (Monthly) - cancelled orders already excluded
  const chartDataMap = new Map<string, number>();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize last 7 months
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    chartDataMap.set(monthName, 0);
  }

  orderItems.forEach(item => {
    const date = new Date(item.order.createdAt);
    const monthName = months[date.getMonth()];
    if (chartDataMap.has(monthName)) {
      chartDataMap.set(monthName, (chartDataMap.get(monthName) || 0) + (Number(item.price) * item.quantity));
    }
  });

  const chartData = Array.from(chartDataMap.entries()).map(([month, sales]) => ({
    month,
    sales
  }));

  // 5. Recent Activity (cancelled orders already excluded)
  // Serialize recent activity items to avoid Decimal errors
  const recentActivity = orderItems.slice(0, 5).map(item => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    quantity: item.quantity,
    price: Number(item.price), // Convert Decimal to number
    order: {
      ...item.order,
      total: Number(item.order.total), // Convert Decimal to number
    },
    product: {
      ...item.product,
      price: Number(item.product.price), // Convert Decimal to number
    }
  }));

  return (
    <VendorDashboard
      initialData={{
        totalSales,
        pendingOrders,
        totalRevenue: Number(totalRevenue), // Ensure it's a number
        chartData,
        recentActivity
      }}
    />
  );
}

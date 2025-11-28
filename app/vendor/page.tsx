import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Edit, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import SalesChart from "@/components/vendor/SalesChart";
import { getAuthenticatedVendor } from "@/lib/api/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VendorPage() {
  const auth = await getAuthenticatedVendor();
  if ('error' in auth) {
    redirect("/auth/login");
  }

  const productCount = await prisma.product.count({
    where: { vendorId: auth.vendor.id },
  });

  // Mock data for now until Order model is implemented
  const orderCount = 0;
  const totalRevenue = 0;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-default-500 mt-1">
            Overview of your store's performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            color="primary"
            href="/vendor/shop-builder"
            as="a"
            startContent={<Edit size={18} />}
            className="font-medium"
          >
            Customize Shop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-primary-50 to-background">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-default-600 uppercase tracking-wider">Total Products</p>
                <h3 className="text-4xl font-bold mt-2">{productCount}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Package size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-success font-medium">
              <TrendingUp size={16} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-default-600 uppercase tracking-wider">Pending Orders</p>
                <h3 className="text-4xl font-bold mt-2">{orderCount}</h3>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl text-warning">
                <ShoppingCart size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm text-default-400">
              No pending orders
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-default-600 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-4xl font-bold mt-2">${totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-success/10 rounded-xl text-success">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm text-default-400">
              Lifetime earnings
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="space-y-6">
          <Card className="h-full border-none shadow-md">
            <CardHeader className="px-6 py-4 border-b border-divider">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="flex flex-col items-center justify-center h-48 text-center text-default-400">
                <div className="p-4 bg-default-100 rounded-full mb-3">
                  <Package size={24} />
                </div>
                <p>No recent activity</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

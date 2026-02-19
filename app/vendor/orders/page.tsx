import type { Metadata } from "next";

import VendorLayout from "@/components/vendor/VendorLayout";
import VendorOrdersPage from "@/components/vendor/VendorOrdersPage";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng",
  description: "Xem và quản lý đơn hàng của cửa hàng",
};

export default function OrdersPage() {
  return (
    <VendorLayout>
      <VendorOrdersPage />
    </VendorLayout>
  );
}

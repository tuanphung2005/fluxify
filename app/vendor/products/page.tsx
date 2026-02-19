import type { Metadata } from "next";

import VendorLayout from "@/components/vendor/VendorLayout";
import ProductManagerContent from "@/components/vendor/ProductManagerContent";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm",
  description: "Quản lý sản phẩm của bạn trên cửa hàng",
};

export default function ProductsPage() {
  return (
    <VendorLayout>
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Sản phẩm</h2>
        <ProductManagerContent />
      </div>
    </VendorLayout>
  );
}

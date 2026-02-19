import type { Metadata } from "next";

import VendorChatPage from "@/components/vendor/VendorChatPage";
import VendorLayout from "@/components/vendor/VendorLayout";

export const metadata: Metadata = {
  title: "Chat khách hàng",
  description: "Trò chuyện với khách hàng của bạn",
};

export default function VendorChatRoute() {
  return (
    <VendorLayout>
      <VendorChatPage />
    </VendorLayout>
  );
}

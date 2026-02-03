"use client";

import { Chip } from "@heroui/chip";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: "warning" | "primary" | "secondary" | "success" | "danger";
  }
> = {
  PENDING: { label: "Đang chờ", color: "warning" },
  PROCESSING: { label: "Đang xử lý", color: "primary" },
  SHIPPED: { label: "Đang giao hàng", color: "secondary" },
  DELIVERED: { label: "Đã giao hàng", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "danger" },
};

export default function OrderStatusBadge({
  status,
  size = "sm",
}: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    color: "default" as const,
  };

  return (
    <Chip color={config.color} size={size} variant="flat">
      {config.label}
    </Chip>
  );
}

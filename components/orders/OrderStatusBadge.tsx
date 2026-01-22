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
  PENDING: { label: "Pending", color: "warning" },
  PROCESSING: { label: "Processing", color: "primary" },
  SHIPPED: { label: "Shipped", color: "secondary" },
  DELIVERED: { label: "Delivered", color: "success" },
  CANCELLED: { label: "Cancelled", color: "danger" },
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

"use client";

import { OrderStatus } from "@prisma/client";

import { api } from "@/lib/api/api";
import { usePollingFetch } from "@/hooks/usePollingFetch";

interface OrdersResponse {
  orders: any[];
  pagination: {
    totalOrders: number;
  };
}

interface UseNewOrdersOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch and poll new (PENDING) orders count
 */
export function useNewOrders({ enabled = true }: UseNewOrdersOptions = {}) {
  const { data, isLoading, refetch } = usePollingFetch<OrdersResponse>({
    fetcher: () =>
      api.get<OrdersResponse>(
        `/api/vendor/orders?status=${OrderStatus.PENDING}&limit=1`,
      ),
    enabled,
  });

  return {
    newOrdersCount: data?.pagination.totalOrders ?? 0,
    isLoading,
    refetch,
  };
}

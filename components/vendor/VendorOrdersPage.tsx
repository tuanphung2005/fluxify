"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Eye, ListOrdered, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api/api";
import OrderDetailsModal from "@/components/vendor/OrderDetailsModal";

interface PaginationInfo {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasMore: boolean;
}

interface OrdersResponse {
  orders: any[];
  pagination: PaginationInfo;
}

const STATUS_OPTIONS = [
  { key: "", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPED", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalOrders: 0,
    totalPages: 1,
    hasMore: false,
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const data = await api.get<OrdersResponse>(`/api/vendor/orders?${params}`);

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Đơn hàng</h2>
        <div className="flex gap-3 items-center">
          <Select
            className="w-40"
            placeholder="Lọc trạng thái"
            selectedKeys={statusFilter ? [statusFilter] : []}
            size="sm"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              handleStatusFilterChange(selected || "");
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.key}>{status.label}</SelectItem>
            ))}
          </Select>
          <Button
            isLoading={isLoading}
            startContent={<RefreshCw size={18} />}
            variant="flat"
            onPress={fetchOrders}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardBody className="p-0">
          {orders.length > 0 ? (
            <Table removeWrapper aria-label="Orders table">
              <TableHeader>
                <TableColumn>Mã đơn</TableColumn>
                <TableColumn>Ngày đặt</TableColumn>
                <TableColumn>Khách hàng</TableColumn>
                <TableColumn>Trạng thái</TableColumn>
                <TableColumn>Tổng tiền</TableColumn>
                <TableColumn align="end">Thao tác</TableColumn>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(-6)}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {order.fullName || order.user?.name || "Khách"}
                        </span>
                        <span className="text-xs text-default-400">
                          {order.phoneNumber || order.user?.email || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          order.status === "PENDING"
                            ? "warning"
                            : order.status === "PROCESSING"
                              ? "primary"
                              : order.status === "SHIPPED"
                                ? "secondary"
                                : order.status === "DELIVERED"
                                  ? "success"
                                  : "default"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {order.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {Number(order.total).toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleViewOrder(order)}
                        >
                          <Eye size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-default-500">
              <ListOrdered className="mx-auto mb-4 opacity-50" size={48} />
              <h3 className="text-lg font-medium">Chưa có đơn hàng nào</h3>
              <p>Khi có đơn hàng mới, chúng sẽ xuất hiện ở đây.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">
            Hiển thị {orders.length} / {pagination.totalOrders} đơn hàng
          </span>
          <Pagination
            isCompact
            showControls
            page={page}
            total={pagination.totalPages}
            onChange={setPage}
          />
        </div>
      )}

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        order={selectedOrder}
        onClose={() => setIsOrderModalOpen(false)}
        onStatusUpdate={fetchOrders}
      />
    </div>
  );
}

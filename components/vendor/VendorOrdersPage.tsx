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
import { Eye, ListOrdered, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

import { api } from "@/lib/api/api";
import OrderDetailsModal from "@/components/vendor/OrderDetailsModal";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any[]>("/api/vendor/orders");

      setOrders(data);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Đơn hàng</h2>
        <Button
          isLoading={isLoading}
          startContent={<RefreshCw size={18} />}
          variant="flat"
          onPress={fetchOrders}
        >
          Làm mới
        </Button>
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

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        order={selectedOrder}
        onClose={() => setIsOrderModalOpen(false)}
        onStatusUpdate={fetchOrders}
      />
    </div>
  );
}

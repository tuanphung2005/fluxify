"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Select, SelectItem } from "@heroui/react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

interface OrderItem {
    id: string;
    product: {
        name: string;
        price: number;
    };
    quantity: number;
    price: number;
    selectedVariant?: string | null;
}

interface Order {
    id: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    status: string;
    total: number;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    items: OrderItem[];
}

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: () => void;
}

const ORDER_STATUSES = [
    { value: "PENDING", label: "Chờ xác nhận", color: "warning" },
    { value: "PROCESSING", label: "Đang xử lý", color: "primary" },
    { value: "SHIPPED", label: "Đang giao", color: "secondary" },
    { value: "DELIVERED", label: "Đã giao", color: "success" },
    { value: "CANCELLED", label: "Đã hủy", color: "danger" },
] as const;

export default function OrderDetailsModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.status);
        }
    }, [order]);

    if (!order) return null;

    const handleUpdateStatus = async () => {
        if (!selectedStatus || selectedStatus === order.status) return;

        setIsLoading(true);
        try {
            await api.patch("/api/vendor/orders", {
                orderId: order.id,
                status: selectedStatus
            });
            toast.success("Cập nhật trạng thái đơn hàng thành công");
            onStatusUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error("Cập nhật trạng thái thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Chi tiết đơn hàng #{order.id.slice(-6)}
                    <span className="text-sm font-normal text-default-500">
                        Đặt ngày {new Date(order.createdAt).toLocaleString()}
                    </span>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        {/* Status Management */}
                        <div className="p-4 bg-default-50 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Trạng thái hiện tại</span>
                                <Chip
                                    color={
                                        order.status === 'PENDING' ? 'warning' :
                                            order.status === 'PROCESSING' ? 'primary' :
                                                order.status === 'SHIPPED' ? 'secondary' :
                                                    order.status === 'DELIVERED' ? 'success' :
                                                        order.status === 'CANCELLED' ? 'danger' : 'default'
                                    }
                                    variant="flat"
                                >
                                    {order.status}
                                </Chip>
                            </div>
                            <Select
                                label="Cập nhật trạng thái"
                                placeholder="Chọn trạng thái mới"
                                selectedKeys={selectedStatus ? [selectedStatus] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setSelectedStatus(selected);
                                }}
                                className="max-w-full"
                                size="sm"
                            >
                                {ORDER_STATUSES.map((status) => (
                                    <SelectItem key={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-default-500 mb-2">Khách hàng</h4>
                                <p>{order.fullName || order.user.name || "Khách"}</p>
                                <p className="text-sm text-default-400">{order.phoneNumber || order.user.email}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-default-500 mb-2">Địa chỉ giao hàng</h4>
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                                <p>{order.address.country}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h4 className="text-sm font-semibold text-default-500 mb-2">Sản phẩm</h4>
                            <div className="border rounded-lg divide-y">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            {item.selectedVariant && (
                                                <p className="text-xs text-default-500">
                                                    {item.selectedVariant.split(',').map(part => {
                                                        const [name, value] = part.split(':');
                                                        return `${name}: ${value}`;
                                                    }).join(', ')}
                                                </p>
                                            )}
                                            <p className="text-sm text-default-400">SL: {item.quantity} x {Number(item.price).toLocaleString('vi-VN')}₫</p>
                                        </div>
                                        <p className="font-semibold">{(Number(item.price) * item.quantity).toLocaleString('vi-VN')}₫</p>
                                    </div>
                                ))}
                                <div className="p-3 bg-default-50 flex justify-between items-center font-bold">
                                    <span>Tổng cộng</span>
                                    <span>{Number(order.total).toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Đóng
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleUpdateStatus}
                        isLoading={isLoading}
                        isDisabled={!selectedStatus || selectedStatus === order.status}
                    >
                        Cập nhật
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

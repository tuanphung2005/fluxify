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
}

interface Order {
    id: string;
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
    { value: "PENDING", label: "Pending", color: "warning" },
    { value: "PROCESSING", label: "Processing", color: "primary" },
    { value: "SHIPPED", label: "Shipped", color: "secondary" },
    { value: "DELIVERED", label: "Delivered", color: "success" },
    { value: "CANCELLED", label: "Cancelled", color: "danger" },
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
            toast.success("Order status updated successfully");
            onStatusUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error("Failed to update order status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Order Details #{order.id.slice(-6)}
                    <span className="text-sm font-normal text-default-500">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                    </span>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        {/* Status Management */}
                        <div className="p-4 bg-default-50 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Current Status</span>
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
                                label="Update Status"
                                placeholder="Select new status"
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

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-default-500 mb-2">Customer</h4>
                                <p>{order.user.name || "Guest"}</p>
                                <p className="text-sm text-default-400">{order.user.email}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-default-500 mb-2">Shipping Address</h4>
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                                <p>{order.address.country}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h4 className="text-sm font-semibold text-default-500 mb-2">Items</h4>
                            <div className="border rounded-lg divide-y">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-default-400">Qty: {item.quantity} x ${Number(item.price).toFixed(2)}</p>
                                        </div>
                                        <p className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                <div className="p-3 bg-default-50 flex justify-between items-center font-bold">
                                    <span>Total</span>
                                    <span>${Number(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Close
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleUpdateStatus}
                        isLoading={isLoading}
                        isDisabled={!selectedStatus || selectedStatus === order.status}
                    >
                        Update Status
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

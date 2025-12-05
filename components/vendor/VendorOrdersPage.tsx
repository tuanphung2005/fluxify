"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
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
            const data = await api.get<any[]>('/api/vendor/orders');
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
                <h2 className="text-2xl font-bold">Orders</h2>
                <Button
                    variant="flat"
                    startContent={<RefreshCw size={18} />}
                    onPress={fetchOrders}
                    isLoading={isLoading}
                >
                    Refresh
                </Button>
            </div>

            <Card className="border-none shadow-md">
                <CardBody className="p-0">
                    {orders.length > 0 ? (
                        <Table aria-label="Orders table" removeWrapper>
                            <TableHeader>
                                <TableColumn>Order ID</TableColumn>
                                <TableColumn>Date</TableColumn>
                                <TableColumn>Customer</TableColumn>
                                <TableColumn>Status</TableColumn>
                                <TableColumn>Total</TableColumn>
                                <TableColumn align="end">Actions</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>#{order.id.slice(-6)}</TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{order.user.name || "Guest"}</span>
                                                <span className="text-xs text-default-400">{order.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    order.status === 'PENDING' ? 'warning' :
                                                        order.status === 'PROCESSING' ? 'primary' :
                                                            order.status === 'SHIPPED' ? 'secondary' :
                                                                order.status === 'DELIVERED' ? 'success' : 'default'
                                                }
                                            >
                                                {order.status}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    isIconOnly
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
                            <ListOrdered size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No orders found</h3>
                            <p>When you receive orders, they will appear here.</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                onStatusUpdate={fetchOrders}
            />
        </div>
    );
}

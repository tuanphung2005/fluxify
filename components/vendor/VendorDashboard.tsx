"use client"

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Edit, Package, ShoppingCart, DollarSign, TrendingUp, ListOrdered, Eye, RefreshCw } from "lucide-react";
import SalesChart from "@/components/vendor/SalesChart";
import { useDisclosure, Chip } from "@heroui/react";
import ProductManager from "@/components/vendor/ProductManager";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import OrderDetailsModal from "@/components/vendor/OrderDetailsModal";
import { useRouter } from "next/navigation";

interface DashboardData {
    totalSales: number;
    pendingOrders: number;
    totalRevenue: number;
    chartData: any[];
    recentActivity: any[];
}

export default function VendorDashboard({ initialData }: { initialData: DashboardData }) {
    const productModal = useDisclosure();
    const [activeTab, setActiveTab] = useState("overview");
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const data = await api.get<any[]>('/api/vendor/orders');
            setOrders(data);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        // Reset refreshing state after a short delay
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="flat"
                        startContent={<RefreshCw size={18} />}
                        onPress={handleRefresh}
                        isLoading={isRefreshing}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="flat"
                        startContent={<Package />}
                        onPress={productModal.onOpen}
                    >
                        Manage Products
                    </Button>
                    <Button
                        color="primary"
                        href="/vendor/shop-builder"
                        as="a"
                        startContent={<Edit size={18} />}
                        className="font-medium"
                    >
                        Customize Shop
                    </Button>
                </div>
            </div>

            <Tabs aria-label="Dashboard Options" selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
                <Tab key="overview" title="Overview">
                    <div className="space-y-8 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-none shadow-md bg-gradient-to-br from-primary-50 to-background">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-default-600 uppercase tracking-wider">Total Sales</p>
                                            <h3 className="text-4xl font-bold mt-2">{initialData.totalSales}</h3>
                                        </div>
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                            <Package size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-success font-medium">
                                        <TrendingUp size={16} className="mr-1" />
                                        <span>Orders count</span>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="border-none shadow-md">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-default-600 uppercase tracking-wider">Pending Orders</p>
                                            <h3 className="text-4xl font-bold mt-2">{initialData.pendingOrders}</h3>
                                        </div>
                                        <div className="p-3 bg-warning/10 rounded-xl text-warning">
                                            <ShoppingCart size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-default-400">
                                        Orders to fulfill
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="border-none shadow-md">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-default-600 uppercase tracking-wider">Total Revenue</p>
                                            <h3 className="text-4xl font-bold mt-2">${initialData.totalRevenue.toLocaleString()}</h3>
                                        </div>
                                        <div className="p-3 bg-success/10 rounded-xl text-success">
                                            <DollarSign size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-default-400">
                                        Lifetime earnings
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <SalesChart data={initialData.chartData} />
                            </div>
                            <div className="space-y-6">
                                <Card className="h-full border-none shadow-md">
                                    <CardHeader className="px-6 py-4 border-b border-divider">
                                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                                    </CardHeader>
                                    <CardBody className="p-6">
                                        {initialData.recentActivity.length > 0 ? (
                                            <div className="space-y-4">
                                                {initialData.recentActivity.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between border-b border-divider last:border-0 pb-3 last:pb-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                                <ShoppingCart size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">New order for {item.product.name}</p>
                                                                <p className="text-xs text-default-400">{new Date(item.order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-bold">${Number(item.price).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 text-center text-default-400">
                                                <div className="p-4 bg-default-100 rounded-full mb-3">
                                                    <Package size={24} />
                                                </div>
                                                <p>No recent activity</p>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Tab>
                <Tab key="orders" title="Orders">
                    <Card className="border-none shadow-md">
                        <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Order Management</h3>
                            <Button size="sm" variant="flat" onPress={fetchOrders} isLoading={isLoadingOrders}>
                                Refresh
                            </Button>
                        </CardHeader>
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
                </Tab>
            </Tabs>

            <ProductManager
                isOpen={productModal.isOpen}
                onOpenChange={productModal.onOpenChange}
                onProductsChange={() => {
                    window.location.reload();
                }}
            />

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                onStatusUpdate={fetchOrders}
            />
        </div>
    );
}

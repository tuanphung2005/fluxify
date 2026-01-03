"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Image } from "@heroui/image";
import { Package, ShoppingBag, X, ChevronRight } from "lucide-react";
import { Order, formatDate, canCancelOrder } from "./types";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

interface OrdersSectionProps {
    orders: Order[];
    cancellingOrderId: string | null;
    onCancelClick: (order: Order) => void;
}

export default function OrdersSection({
    orders,
    cancellingOrderId,
    onCancelClick
}: OrdersSectionProps) {
    return (
        <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package size={20} />
                My Orders
            </h2>
            {orders.length > 0 ? (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Card key={order.id} className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-default-50 flex justify-between items-center gap-3 px-4 py-3">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-mono font-semibold text-sm">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-default-500">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <p className="font-semibold">
                                        ${Number(order.total).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <OrderStatusBadge status={order.status} size="sm" />
                                    {canCancelOrder(order.status) && (
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            isIconOnly
                                            onPress={() => onCancelClick(order)}
                                            isLoading={cancellingOrderId === order.id}
                                        >
                                            <X size={14} />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardBody className="p-0">
                                <Accordion selectionMode="multiple" className="px-0">
                                    <AccordionItem
                                        key="items"
                                        aria-label="Order Items"
                                        title={
                                            <span className="text-sm font-medium">
                                                {order.items.length} {order.items.length === 1 ? "item" : "items"}
                                            </span>
                                        }
                                        indicator={<ChevronRight size={16} />}
                                        className="px-4"
                                    >
                                        <div className="space-y-2 pb-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-default-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product.images?.[0] ? (
                                                            <Image
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={16} className="text-default-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-xs text-default-500">
                                                            {item.quantity} × ${Number(item.price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-sm">
                                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionItem>
                                </Accordion>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-none shadow-sm h-full">
                    <CardBody className="text-center py-8 flex flex-col items-center justify-center">
                        <ShoppingBag size={40} className="mx-auto mb-3 text-default-300" />
                        <h3 className="font-semibold mb-1">No orders yet</h3>
                        <p className="text-default-500 text-sm mb-4">
                            When you place orders, they will appear here.
                        </p>
                        <Button color="primary" href="/" as="a" size="sm">
                            Start Shopping
                        </Button>
                    </CardBody>
                </Card>
            )}
        </section>
    );
}

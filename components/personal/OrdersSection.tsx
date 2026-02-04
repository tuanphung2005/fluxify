"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Image } from "@heroui/image";
import { Package, ShoppingBag, X, ChevronRight, Star, CheckCircle } from "lucide-react";

import { Order, formatDate, canCancelOrder } from "./types";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import ReviewModal from "@/components/shop/ReviewModal";

interface OrdersSectionProps {
  orders: Order[];
  cancellingOrderId: string | null;
  onCancelClick: (order: Order) => void;
  onReviewSuccess?: (orderId: string) => void;
}

interface ReviewableOrder {
  id: string;
  products: {
    name: string;
    image: string | null;
    variant: string | null;
  }[];
}

export default function OrdersSection({
  orders,
  cancellingOrderId,
  onCancelClick,
  onReviewSuccess,
}: OrdersSectionProps) {
  const [reviewOrder, setReviewOrder] = useState<ReviewableOrder | null>(null);

  const handleReviewClick = (order: Order) => {
    setReviewOrder({
      id: order.id,
      products: order.items.map((item) => ({
        name: item.product.name,
        image: item.product.images?.[0] || null,
        variant: item.selectedVariant,
      })),
    });
  };

  const canReviewOrder = (order: Order) => order.status === "DELIVERED";

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Package size={20} />
        Đơn hàng
      </h2>
      {orders.length > 0 ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-none shadow-md overflow-hidden"
            >
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
                    {Number(order.total).toFixed(2)}₫
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge size="sm" status={order.status} />

                  {/* Review button - per order */}
                  {canReviewOrder(order) && (
                    order.hasReview ? (
                      <span className="flex items-center gap-1 text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} />
                        Đã đánh giá
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        startContent={<Star size={12} />}
                        variant="flat"
                        onPress={() => handleReviewClick(order)}
                      >
                        Đánh giá
                      </Button>
                    )
                  )}

                  {canCancelOrder(order.status) && (
                    <Button
                      isIconOnly
                      color="danger"
                      isLoading={cancellingOrderId === order.id}
                      size="sm"
                      variant="flat"
                      onPress={() => onCancelClick(order)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardBody className="p-0">
                <Accordion className="px-0" selectionMode="multiple">
                  <AccordionItem
                    key="items"
                    aria-label="Order Items"
                    className="px-4"
                    indicator={<ChevronRight size={16} />}
                    title={
                      <span className="text-sm font-medium">
                        {order.items.length} sản phẩm
                      </span>
                    }
                  >
                    <div className="space-y-2 pb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-default-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images?.[0] ? (
                              <Image
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                src={item.product.images[0]}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package
                                  className="text-default-300"
                                  size={16}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-default-500">
                              {item.quantity} × {Number(item.price).toFixed(2)}₫
                              {item.selectedVariant && (
                                <span className="ml-1 text-default-400">
                                  ({item.selectedVariant})
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-sm">
                            {(Number(item.price) * item.quantity).toFixed(2)}₫
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
            <ShoppingBag className="mx-auto mb-3 text-default-300" size={40} />
            <h3 className="font-semibold mb-1">Chưa có đơn nào</h3>
            <p className="text-default-500 text-sm mb-4">
              Khi bạn đặt hàng thành công thì đơn hàng sẽ hiện ở đây.
            </p>
            <Button as="a" color="primary" href="/" size="sm">
              Bắt đầu mua sắm
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={!!reviewOrder}
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => onReviewSuccess?.(reviewOrder.id)}
        />
      )}
    </section>
  );
}

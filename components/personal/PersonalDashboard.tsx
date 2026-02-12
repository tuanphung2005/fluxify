"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";

import { PersonalData, Order } from "./types";
import StatsCards from "./StatsCards";
import FavoriteShopsSection from "./FavoriteShopsSection";
import OrdersSection from "./OrdersSection";
import CancelOrderModal from "./CancelOrderModal";
import ChangePasswordModal from "./ChangePasswordModal";

import { toast } from "@/lib/toast";
import { api } from "@/lib/api/api";
import ErrorDisplay from "@/app/error";

export default function PersonalDashboard() {
  const [data, setData] = useState<PersonalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [removingShopId, setRemovingShopId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await api.get<PersonalData>("/api/user/personal");

      setData(result);
    } catch (error) {
      console.error("Failed to fetch personal data:", error);
      toast.error("Failed to load personal data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    setCancellingOrderId(orderToCancel.id);
    try {
      await api.patch("/api/user/orders", { orderId: orderToCancel.id });
      toast.success("Order cancelled successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const handleRemoveFavoriteShop = async (vendorId: string) => {
    setRemovingShopId(vendorId);
    try {
      await api.delete("/api/user/personal/favorite-shops", { vendorId });
      toast.success("Shop removed from favorites");
      fetchData();
    } catch (error) {
      console.error("Failed to remove favorite shop:", error);
      toast.error("Failed to remove shop");
    } finally {
      setRemovingShopId(null);
    }
  };



  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardBody className="h-24" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardBody className="h-32" />
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Error state
    if (!data) {
      return (
        <Card className="border-none shadow-md">
          <CardBody>
            <ErrorDisplay
              minimal
              error={new Error("Failed to load personal data") as any}
              reset={fetchData}
            />
          </CardBody>
        </Card>
      );
    }

    // Loaded state
    return (
      <>
        <StatsCards
          memberSince={data.user.memberSince}
          totalOrders={data.stats.totalOrders}
          totalSpent={data.stats.totalSpent}
        />

        {/* Favorite Shops left and Orders right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FavoriteShopsSection
            removingShopId={removingShopId}
            shops={data.favoriteShops}
            onRemove={handleRemoveFavoriteShop}
          />

          <OrdersSection
            cancellingOrderId={cancellingOrderId}
            orders={data.orders}
            onCancelClick={handleCancelClick}
            onReviewSuccess={(orderId: string) => {
              // Update only the specific order's hasReview state locally
              setData(prev => prev ? {
                ...prev,
                orders: prev.orders.map(order =>
                  order.id === orderId ? { ...order, hasReview: true } : order
                )
              } : null);
            }}
          />
        </div>

        {/* Security Section */}
        <Card className="mt-15 border-none shadow-md">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bảo mật</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mật khẩu</p>
                <p className="text-sm text-default-500">
                  Đổi mật khẩu để bảo vệ tài khoản của bạn
                </p>
              </div>
              <Button
                className="border-danger text-danger"
                startContent={<KeyRound size={16} />}
                variant="bordered"
                onPress={() => setShowPasswordModal(true)}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </CardBody>
        </Card>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

      {renderContent()}

      <CancelOrderModal
        isLoading={cancellingOrderId !== null}
        isOpen={showCancelModal}
        order={orderToCancel}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        userEmail={data?.user.email || ""}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}


"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Mail, KeyRound, X } from "lucide-react";

import { PersonalData, Order } from "./types";
import StatsCards from "./StatsCards";
import FavoriteShopsSection from "./FavoriteShopsSection";
import OrdersSection from "./OrdersSection";
import CancelOrderModal from "./CancelOrderModal";
import ChangePasswordModal from "./ChangePasswordModal";

import { toast } from "@/lib/toast";
import { api } from "@/lib/api/api";
import ErrorDisplay from "@/app/error";

const VERIFIED_BANNER_DISMISSED_KEY = "email_verified_banner_dismissed";

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
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(true);

  // Email verification state
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
    // Check if verified banner was dismissed
    const dismissed = localStorage.getItem(VERIFIED_BANNER_DISMISSED_KEY);
    if (dismissed === "true") {
      setShowVerifiedBanner(false);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (!data?.user.email || cooldown > 0) return;

    setIsResending(true);
    try {
      await api.put("/api/auth/verify", { email: data.user.email });
      toast.success("Email xác thực đã được gửi!");
      setCooldown(60);
    } catch (error: any) {
      // Check for cooldown error from backend
      if (error.status === 429 && error.message) {
        const match = error.message.match(/(\d+)/);
        if (match) {
          setCooldown(parseInt(match[1], 10));
        }
        toast.error(error.message);
      } else {
        toast.error("Không thể gửi email xác thực");
      }
    } finally {
      setIsResending(false);
    }
  };

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

  const handleDismissVerifiedBanner = () => {
    setShowVerifiedBanner(false);
    localStorage.setItem(VERIFIED_BANNER_DISMISSED_KEY, "true");
  };

  const renderVerificationBanner = () => {
    if (!data) return null;

    if (data.user.emailVerified) {
      if (!showVerifiedBanner) return null;

      return (
        <div className="mb-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800 flex items-center gap-3">
          <CheckCircle className="text-success flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-medium text-success-700 dark:text-success-400">
              Email đã được xác thực
            </p>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={handleDismissVerifiedBanner}
          >
            <X size={16} className="text-success-600" />
          </Button>
        </div>
      );
    }

    return (
      <div className="mb-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-warning-700 dark:text-warning-400">
              Email chưa được xác thực
            </p>
            <p className="text-sm text-warning-600 dark:text-warning-500 mt-1">
              Vui lòng xác thực email để có thể mua hàng. Kiểm tra hộp thư của bạn hoặc gửi lại email xác thực.
            </p>
          </div>
          <Button
            color="warning"
            isDisabled={cooldown > 0}
            isLoading={isResending}
            size="sm"
            startContent={!isResending && cooldown === 0 && <Mail size={16} />}
            variant="flat"
            onPress={handleResendVerification}
          >
            {cooldown > 0 ? `Đợi ${cooldown}s` : "Gửi lại"}
          </Button>
        </div>
      </div>
    );
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
        {renderVerificationBanner()}

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


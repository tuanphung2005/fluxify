"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";
import { PersonalData, Order } from "./types";
import StatsCards from "./StatsCards";
import FavoriteShopsSection from "./FavoriteShopsSection";
import OrdersSection from "./OrdersSection";
import CancelOrderModal from "./CancelOrderModal";

export default function PersonalDashboard() {
    const [data, setData] = useState<PersonalData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [removingShopId, setRemovingShopId] = useState<string | null>(null);

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

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">My Account</h1>
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
            </div>
        );
    }

    // Error state
    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="border-none shadow-md">
                    <CardBody className="text-center py-16">
                        <p className="text-default-500">Failed to load personal data</p>
                        <Button color="primary" className="mt-4" onPress={fetchData}>
                            Try Again
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Account</h1>

            <StatsCards
                totalOrders={data.stats.totalOrders}
                totalSpent={data.stats.totalSpent}
                memberSince={data.user.memberSince}
            />

            {/* Two Column Layout: Favorite Shops (left) and Orders (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FavoriteShopsSection
                    shops={data.favoriteShops}
                    removingShopId={removingShopId}
                    onRemove={handleRemoveFavoriteShop}
                />

                <OrdersSection
                    orders={data.orders}
                    cancellingOrderId={cancellingOrderId}
                    onCancelClick={handleCancelClick}
                />
            </div>

            <CancelOrderModal
                isOpen={showCancelModal}
                order={orderToCancel}
                isLoading={cancellingOrderId !== null}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelConfirm}
            />
        </div>
    );
}

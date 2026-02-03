"use client";

import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Package, Star, Truck, Calendar } from "lucide-react";
import useSWR from "swr";

import StarRating from "@/components/shop/StarRating";

interface ShopStats {
    storeName: string;
    productCount: number;
    totalReviews: number;
    avgProductRating: number;
    avgShippingRating: number;
    shopCreatedAt: string;
    shopAgeInDays: number;
}

interface ShopOverviewProps {
    vendorId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatShopAge(days: number): string {
    if (days < 30) {
        return `${days} ngày trước`;
    }
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} tháng trước`;
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    if (remainingMonths === 0) {
        return `${years} năm trước`;
    }
    return `${years} năm, ${remainingMonths} tháng trước`;
}

export default function ShopOverview({ vendorId }: ShopOverviewProps) {
    const { data, isLoading, error } = useSWR<ShopStats>(
        `/api/shop/${vendorId}/stats`,
        fetcher
    );

    if (error) {
        return null;
    }

    if (isLoading) {
        return (
            <Card className="mb-6 border-none shadow-md">
                <CardBody className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20 rounded" />
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (!data) return null;

    const stats = [
        {
            icon: Package,
            label: "Products",
            value: data.productCount.toString(),
            color: "text-primary",
        },
        {
            icon: Star,
            label: "Đánh giá sản phẩm",
            value: data.avgProductRating > 0 ? data.avgProductRating.toFixed(1) : "N/A",
            showStars: data.avgProductRating > 0,
            rating: data.avgProductRating,
            color: "text-warning",
        },
        {
            icon: Truck,
            label: "Đánh giá vận chuyển",
            value: data.avgShippingRating > 0 ? data.avgShippingRating.toFixed(1) : "N/A",
            showStars: data.avgShippingRating > 0,
            rating: data.avgShippingRating,
            color: "text-success",
        },
        {
            icon: Calendar,
            label: "Tuổi shop",
            value: formatShopAge(data.shopAgeInDays),
            subtext: `${data.totalReviews} đánh giá`,
            color: "text-secondary",
        },
    ];

    return (
        <Card className="mb-6 border-none shadow-md bg-gradient-to-r from-default-50 to-default-100">
            <CardBody className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-default-100 ${stat.color}`}>
                                <stat.icon size={30} />
                            </div>
                            <div>
                                <p className="text-xs text-default-500 uppercase tracking-wide">
                                    {stat.label}
                                </p>
                                <div className="flex items-center gap-2">
                                    {stat.showStars ? (
                                        <StarRating rating={stat.rating!} showValue size="sm" />
                                    ) : (
                                        <p className="font-semibold text-lg">{stat.value}</p>
                                    )}
                                </div>
                                {stat.subtext && (
                                    <p className="text-xs text-default-400">{stat.subtext}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}

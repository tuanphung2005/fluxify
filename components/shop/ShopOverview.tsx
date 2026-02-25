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
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-md">
                        <CardBody className="p-4 flex flex-row items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-3 w-20 rounded" />
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const stats = [
        {
            icon: Package,
            label: "Sản phẩm",
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
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="border-none shadow-md bg-gradient-to-br from-default-50 to-default-100 hover:shadow-lg transition-shadow">
                    <CardBody className="p-4 flex flex-row items-center gap-4">
                        <div className={`p-3 rounded-full bg-default-200/50 ${stat.color}`}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                                {stat.label}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                {stat.showStars ? (
                                    <StarRating rating={stat.rating!} showValue size="sm" />
                                ) : (
                                    <p className="font-bold text-xl leading-none">{stat.value}</p>
                                )}
                            </div>
                            {stat.subtext && (
                                <p className="text-[10px] text-default-400 mt-1 uppercase tracking-wider font-semibold">{stat.subtext}</p>
                            )}
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

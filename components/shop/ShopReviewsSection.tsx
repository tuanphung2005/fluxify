"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { MessageSquare, ChevronDown, Star, X } from "lucide-react";
import useSWR from "swr";

import ReviewCard from "@/components/shop/ReviewCard";

interface Review {
    id: string;
    rating: number;
    shippingRating: number | null;
    comment: string | null;
    createdAt: string;
    isVerified: boolean;
    customerName: string;
    product: {
        id: string;
        name: string;
        image: string | null;
    };
    variant: string | null;
}

interface ReviewsResponse {
    reviews: Review[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    distribution: Record<number, number>;
}

interface ShopReviewsSectionProps {
    vendorId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function RatingBar({
    stars,
    count,
    total,
    isActive,
    onClick
}: {
    stars: number;
    count: number;
    total: number;
    isActive: boolean;
    onClick: () => void;
}) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <button
            className={`flex items-center gap-2 w-full py-1.5 px-2 rounded-lg transition-colors hover:bg-default-100 ${isActive ? "bg-primary-100" : ""
                }`}
            onClick={onClick}
        >
            <span className="flex items-center gap-1 w-10 text-sm font-medium">
                {stars}
                <Star className="text-warning fill-warning" size={12} />
            </span>
            <div className="flex-1 h-2.5 bg-default-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-warning rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-8 text-right text-sm text-default-500">{count}</span>
        </button>
    );
}

export default function ShopReviewsSection({ vendorId }: ShopReviewsSectionProps) {
    const [page, setPage] = useState(1);
    const [productRatingFilter, setProductRatingFilter] = useState<number | null>(null);
    const limit = 5;

    // Build URL with filters
    let url = `/api/shop/${vendorId}/reviews?page=${page}&limit=${limit}`;
    if (productRatingFilter) {
        url += `&productRating=${productRatingFilter}`;
    }

    const { data, isLoading, error } = useSWR<ReviewsResponse>(url, fetcher);

    const handleRatingClick = (stars: number) => {
        if (productRatingFilter === stars) {
            // Clear filter if clicking same rating
            setProductRatingFilter(null);
        } else {
            setProductRatingFilter(stars);
        }
        setPage(1); // Reset to first page when filtering
    };

    const clearFilters = () => {
        setProductRatingFilter(null);
        setPage(1);
    };

    if (error) {
        return null;
    }

    // Calculate total from distribution
    const totalReviews = data?.distribution
        ? Object.values(data.distribution).reduce((a, b) => a + b, 0)
        : 0;

    if (!isLoading && totalReviews === 0) {
        return null;
    }

    return (
        <Card className="border-none shadow-lg bg-default-50/50 backdrop-blur-sm max-w-6xl mx-auto">
            <CardHeader className="flex items-center gap-2 px-6 py-4 border-b border-default-200">
                <MessageSquare className="text-primary" size={20} />
                <h2 className="text-lg font-semibold">Đánh giá</h2>
                {data && (
                    <span className="text-sm text-default-500 ml-2">
                        ({totalReviews} đánh giá)
                    </span>
                )}
            </CardHeader>

            <CardBody className="p-6">
                {isLoading && !data ? (
                    <div className="space-y-4 max-w-2xl">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-3 p-4 bg-default-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-24 rounded" />
                                    <Skeleton className="h-4 w-16 rounded" />
                                </div>
                                <Skeleton className="h-12 w-full rounded" />
                                <Skeleton className="h-4 w-3/4 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Rating Distribution Sidebar */}
                        {data?.distribution && (
                            <div className="lg:w-72 flex-shrink-0">
                                <div className="lg:sticky lg:top-4 p-4 bg-default-100/50 rounded-xl">
                                    <p className="text-sm font-medium text-default-600 mb-3">
                                        Phân bố đánh giá
                                    </p>
                                    <div className="space-y-1">
                                        {[5, 4, 3, 2, 1].map((stars) => (
                                            <RatingBar
                                                key={stars}
                                                count={data.distribution[stars] || 0}
                                                isActive={productRatingFilter === stars}
                                                stars={stars}
                                                total={totalReviews}
                                                onClick={() => handleRatingClick(stars)}
                                            />
                                        ))}
                                    </div>

                                    {/* Active filter indicator */}
                                    {productRatingFilter && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-default-200">
                                            <span className="text-sm text-default-500">
                                                Đang lọc: {productRatingFilter}★
                                            </span>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="flat"
                                                onPress={clearFilters}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="flex-1 min-w-0 max-w-3xl">
                            <div className="space-y-4">
                                {data?.reviews.map((review: Review) => (
                                    <ReviewCard
                                        key={review.id}
                                        comment={review.comment}
                                        createdAt={review.createdAt}
                                        customerName={review.customerName}
                                        isVerified={review.isVerified}
                                        productImage={review.product.image}
                                        productName={review.product.name}
                                        rating={review.rating}
                                        shippingRating={review.shippingRating}
                                        variant={review.variant}
                                    />
                                ))}

                                {/* No reviews for filter */}
                                {data?.reviews.length === 0 && productRatingFilter && (
                                    <div className="text-center py-8 text-default-500">
                                        <p>Không có đánh giá {productRatingFilter}★ nào</p>
                                        <Button
                                            className="mt-2"
                                            size="sm"
                                            variant="flat"
                                            onPress={clearFilters}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {data && data.pagination.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        isDisabled={page === 1}
                                        size="sm"
                                        variant="flat"
                                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Trước
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-default-500">
                                        Trang {page} của {data.pagination.totalPages}
                                    </span>
                                    <Button
                                        isDisabled={page >= data.pagination.totalPages}
                                        size="sm"
                                        variant="flat"
                                        onPress={() => setPage((p) => p + 1)}
                                    >
                                        Tiếp theo
                                    </Button>
                                </div>
                            )}

                            {/* Load more button for better UX */}
                            {data && page === 1 && data.pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-4">
                                    <Button
                                        className="gap-2"
                                        endContent={<ChevronDown size={16} />}
                                        variant="light"
                                        onPress={() => setPage((p) => p + 1)}
                                    >
                                        Hiện thêm đánh giá
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

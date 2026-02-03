"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { MessageSquare, ChevronDown } from "lucide-react";
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
}

interface ShopReviewsSectionProps {
    vendorId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ShopReviewsSection({ vendorId }: ShopReviewsSectionProps) {
    const [page, setPage] = useState(1);
    const limit = 5;

    const { data, isLoading, error } = useSWR<ReviewsResponse>(
        `/api/shop/${vendorId}/reviews?page=${page}&limit=${limit}`,
        fetcher
    );

    if (error) {
        return null;
    }

    if (!isLoading && (!data?.reviews || data.reviews.length === 0)) {
        return null;
    }

    return (
        <Card className="border-none shadow-lg bg-default-50/50 backdrop-blur-sm">
            <CardHeader className="flex items-center gap-2 px-6 py-4 border-b border-default-200">
                <MessageSquare className="text-primary" size={20} />
                <h2 className="text-lg font-semibold">Đánh giá</h2>
                {data && (
                    <span className="text-sm text-default-500 ml-2">
                        ({data.pagination.total} đánh giá)
                    </span>
                )}
            </CardHeader>

            <CardBody className="p-6">
                {isLoading ? (
                    <div className="space-y-4">
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
                    <>
                        <div className="space-y-4">
                            {data?.reviews.map((review) => (
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
                    </>
                )}
            </CardBody>
        </Card>
    );
}

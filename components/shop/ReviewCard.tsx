import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Package, CheckCircle } from "lucide-react";

import StarRating from "@/components/shop/StarRating";

interface ReviewCardProps {
    customerName: string;
    productName: string;
    productImage: string | null;
    variant: string | null;
    rating: number;
    shippingRating: number | null;
    comment: string | null;
    createdAt: string;
    isVerified: boolean;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ReviewCard({
    customerName,
    productName,
    productImage,
    variant,
    rating,
    shippingRating,
    comment,
    createdAt,
    isVerified,
}: ReviewCardProps) {
    return (
        <Card className="border-none shadow-sm">
            <CardBody className="p-4 gap-3">
                {/* Customer & Date */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-default-700">{customerName}</span>
                        {isVerified && (
                            <span className="flex items-center gap-1 text-xs text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                                <CheckCircle size={12} />
                                Đã xác minh
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-default-400">{formatDate(createdAt)}</span>
                </div>

                {/* Product info */}
                <div className="flex items-center gap-3 p-2 bg-default-50 rounded-lg">
                    <div className="w-10 h-10 bg-default-100 rounded overflow-hidden flex-shrink-0">
                        {productImage ? (
                            <Image
                                alt={productName}
                                className="w-full h-full object-cover"
                                src={productImage}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-default-300" size={16} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{productName}</p>
                        {variant && (
                            <p className="text-xs text-default-500 truncate">{variant}</p>
                        )}
                    </div>
                </div>

                {/* Ratings */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-default-500">Sản phẩm:</span>
                        <StarRating rating={rating} size="sm" />
                    </div>
                    {shippingRating && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-default-500">Vận chuyển:</span>
                            <StarRating rating={shippingRating} size="sm" />
                        </div>
                    )}
                </div>

                {/* Comment */}
                {comment && (
                    <p className="text-sm text-default-600 whitespace-pre-wrap">
                        {comment}
                    </p>
                )}
            </CardBody>
        </Card>
    );
}

"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Image } from "@heroui/image";
import { Package } from "lucide-react";

import StarRating from "@/components/shop/StarRating";

interface OrderProduct {
    name: string;
    image: string | null;
    variant: string | null;
}

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: string;
        products: OrderProduct[];
    };
    onSuccess?: () => void;
}

export default function ReviewModal({
    isOpen,
    onClose,
    order,
    onSuccess,
}: ReviewModalProps) {
    const [productRating, setProductRating] = useState(0);
    const [shippingRating, setShippingRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (productRating === 0) {
            setError("Vui lòng đánh giá sản phẩm");
            return;
        }
        if (shippingRating === 0) {
            setError("Vui lòng đánh giá vận chuyển");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    rating: productRating,
                    shippingRating,
                    comment: comment.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Không thể gửi đánh giá");
            }

            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể gửi đánh giá");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setProductRating(0);
        setShippingRating(0);
        setComment("");
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} size="lg" onClose={handleClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">Đánh giá đơn hàng</h3>
                    <p className="text-sm text-default-500">
                        Đánh giá sẽ áp dụng cho tất cả {order.products.length} sản phẩm trong đơn
                    </p>
                </ModalHeader>

                <ModalBody className="gap-6">
                    {/* Products list */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-default-600">Sản phẩm trong đơn:</p>
                        <div className="flex flex-wrap gap-2">
                            {order.products.map((product, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 bg-default-50 rounded-lg"
                                >
                                    <div className="w-10 h-10 bg-default-100 rounded overflow-hidden flex-shrink-0">
                                        {product.image ? (
                                            <Image
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                src={product.image}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="text-default-300" size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate max-w-[150px]">
                                            {product.name}
                                        </p>
                                        {product.variant && (
                                            <p className="text-xs text-default-400">{product.variant}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Đánh giá sản phẩm <span className="text-danger">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <StarRating
                                interactive
                                rating={productRating}
                                size="lg"
                                onRatingChange={setProductRating}
                            />
                            <span className="text-sm text-default-500">
                                {productRating > 0 ? `${productRating} sao` : "Chọn đánh giá"}
                            </span>
                        </div>
                    </div>

                    {/* Shipping rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Đánh giá vận chuyển <span className="text-danger">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <StarRating
                                interactive
                                rating={shippingRating}
                                size="lg"
                                onRatingChange={setShippingRating}
                            />
                            <span className="text-sm text-default-500">
                                {shippingRating > 0 ? `${shippingRating} sao` : "Chọn đánh giá"}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Bình luận <span className="text-default-400">(Không bắt buộc)</span>
                        </label>
                        <Textarea
                            maxLength={2000}
                            placeholder="Chia sẻ cảm nghĩ của bạn về đơn hàng..."
                            value={comment}
                            onValueChange={setComment}
                        />
                        <p className="text-xs text-default-400 text-right">
                            {comment.length}/2000
                        </p>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" onPress={handleClose}>
                        Hủy
                    </Button>
                    <Button
                        color="primary"
                        isLoading={isSubmitting}
                        onPress={handleSubmit}
                    >
                        Gửi đánh giá
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

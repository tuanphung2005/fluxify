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

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderItem: {
        id: string;
        productName: string;
        productImage: string | null;
        selectedVariant: string | null;
    };
    onSuccess?: () => void;
}

export default function ReviewModal({
    isOpen,
    onClose,
    orderItem,
    onSuccess,
}: ReviewModalProps) {
    const [productRating, setProductRating] = useState(0);
    const [shippingRating, setShippingRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (productRating === 0) {
            setError("Please rate the product");
            return;
        }
        if (shippingRating === 0) {
            setError("Please rate the shipping");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderItemId: orderItem.id,
                    rating: productRating,
                    shippingRating,
                    comment: comment.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit review");
            }

            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit review");
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
                    <h3 className="text-lg font-semibold">Viết đánh giá</h3>
                    <p className="text-sm text-default-500">
                        Chia sẻ trải nghiệm của bạn với sản phẩm
                    </p>
                </ModalHeader>

                <ModalBody className="gap-6">
                    {/* Product info */}
                    <div className="flex items-center gap-4 p-3 bg-default-50 rounded-lg">
                        <div className="w-16 h-16 bg-default-100 rounded-lg overflow-hidden flex-shrink-0">
                            {orderItem.productImage ? (
                                <Image
                                    alt={orderItem.productName}
                                    className="w-full h-full object-cover"
                                    src={orderItem.productImage}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="text-default-300" size={24} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{orderItem.productName}</p>
                            {orderItem.selectedVariant && (
                                <p className="text-sm text-default-500">
                                    {orderItem.selectedVariant}
                                </p>
                            )}
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
                                {productRating > 0 ? `${productRating} star${productRating !== 1 ? "s" : ""}` : "Select rating"}
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
                                {shippingRating > 0 ? `${shippingRating} star${shippingRating !== 1 ? "s" : ""}` : "Select rating"}
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
                            placeholder="Chia sẻ cảm nghĩ của bạn về sản phẩm..."
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
                        Đăng bình luận
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

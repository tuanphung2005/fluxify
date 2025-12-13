"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { Spinner } from "@heroui/spinner";
import { MessageSquare, CheckCircle } from "lucide-react";
import StarRating from "./StarRating";
import { api } from "@/lib/api/api";
import { addToast } from "@heroui/toast";
import type { ReviewData, ReviewSummary } from "@/types/api";

interface ReviewSectionProps {
    productId: string;
    isAuthenticated?: boolean;
}

interface ReviewResponse {
    data: ReviewData[];
    summary: ReviewSummary;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function ReviewSection({ productId, isAuthenticated = false }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<ReviewResponse>(
                `/api/products/${productId}/reviews?summary=true&limit=5`
            );
            setReviews(response.data || []);
            setSummary(response.summary || null);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            addToast({ title: "Please select a rating", color: "warning" });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/api/products/${productId}/reviews`, {
                rating,
                title: title || undefined,
                comment: comment || undefined,
            });

            addToast({ title: "Review submitted successfully!", color: "success" });
            setShowForm(false);
            setRating(0);
            setTitle("");
            setComment("");
            fetchReviews();
        } catch (error) {
            addToast({
                title: error instanceof Error ? error.message : "Failed to submit review",
                color: "danger"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardBody className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                {isAuthenticated && !showForm && (
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={() => setShowForm(true)}
                    >
                        Write a Review
                    </Button>
                )}
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
                {/* Summary */}
                {summary && summary.totalReviews > 0 && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="text-center md:text-left">
                            <div className="text-4xl font-bold">{summary.avgRating.toFixed(1)}</div>
                            <StarRating rating={summary.avgRating} size="md" />
                            <div className="text-sm text-default-500 mt-1">
                                {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="w-8 text-sm">{star} ★</span>
                                    <Progress
                                        value={(summary.distribution[star as 1 | 2 | 3 | 4 | 5] / summary.totalReviews) * 100}
                                        className="flex-1"
                                        size="sm"
                                    />
                                    <span className="w-8 text-sm text-default-500">
                                        {summary.distribution[star as 1 | 2 | 3 | 4 | 5]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Review Form */}
                {showForm && (
                    <>
                        <Divider />
                        <div className="space-y-4 bg-default-50 p-4 rounded-lg">
                            <h4 className="font-semibold">Write Your Review</h4>

                            <div>
                                <label className="text-sm text-default-600 mb-2 block">Rating *</label>
                                <StarRating
                                    rating={rating}
                                    interactive
                                    size="lg"
                                    onRatingChange={setRating}
                                />
                            </div>

                            <Input
                                label="Review Title (optional)"
                                placeholder="Summarize your experience"
                                value={title}
                                onValueChange={setTitle}
                                maxLength={200}
                            />

                            <Textarea
                                label="Your Review (optional)"
                                placeholder="Share your thoughts about this product..."
                                value={comment}
                                onValueChange={setComment}
                                maxLength={2000}
                                minRows={3}
                            />

                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    onPress={handleSubmit}
                                    isLoading={isSubmitting}
                                >
                                    Submit Review
                                </Button>
                                <Button
                                    variant="flat"
                                    onPress={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        <Divider />
                        {reviews.map((review) => (
                            <div key={review.id} className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        name={review.user?.name || "User"}
                                        src={review.user?.image || undefined}
                                        size="sm"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {review.user?.name || "Anonymous"}
                                            </span>
                                            {review.isVerified && (
                                                <span className="flex items-center gap-1 text-xs text-success">
                                                    <CheckCircle size={12} />
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>
                                    <span className="text-xs text-default-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.title && (
                                    <h5 className="font-semibold">{review.title}</h5>
                                )}
                                {review.comment && (
                                    <p className="text-default-600">{review.comment}</p>
                                )}
                                <Divider className="mt-4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-default-500">
                        <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                        <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

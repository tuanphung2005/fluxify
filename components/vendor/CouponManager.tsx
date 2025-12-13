"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useDisclosure } from "@heroui/react";
import { Plus, Trash2, Ticket, Percent, DollarSign, Calendar } from "lucide-react";
import { api } from "@/lib/api/api";
import { addToast } from "@heroui/toast";
import type { CouponData } from "@/types/api";

export default function CouponManager() {
    const [coupons, setCoupons] = useState<CouponData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
        discountValue: "",
        minPurchase: "",
        maxDiscount: "",
        usageLimit: "",
        validUntil: "",
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get<CouponData[]>("/api/vendor/coupons");
            setCoupons(response || []);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (onClose: () => void) => {
        if (!formData.code || !formData.discountValue) {
            addToast({ title: "Code and discount value are required", color: "warning" });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/api/vendor/coupons", {
                code: formData.code,
                description: formData.description || undefined,
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
            });

            addToast({ title: "Coupon created successfully!", color: "success" });
            resetForm();
            onClose();
            fetchCoupons();
        } catch (error) {
            addToast({
                title: error instanceof Error ? error.message : "Failed to create coupon",
                color: "danger"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (couponId: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        try {
            await api.delete(`/api/vendor/coupons?id=${couponId}`);
            addToast({ title: "Coupon deleted", color: "success" });
            setCoupons(coupons.filter(c => c.id !== couponId));
        } catch (error) {
            addToast({ title: "Failed to delete coupon", color: "danger" });
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            description: "",
            discountType: "PERCENTAGE",
            discountValue: "",
            minPurchase: "",
            maxDiscount: "",
            usageLimit: "",
            validUntil: "",
        });
    };

    const getCouponStatus = (coupon: CouponData) => {
        if (!coupon.isActive) return { label: "Inactive", color: "default" as const };
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
            return { label: "Expired", color: "danger" as const };
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { label: "Limit Reached", color: "warning" as const };
        }
        return { label: "Active", color: "success" as const };
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Ticket size={24} />
                    <h3 className="text-lg font-semibold">Coupons & Discounts</h3>
                </div>
                <Button color="primary" startContent={<Plus size={18} />} onPress={onOpen}>
                    Create Coupon
                </Button>
            </CardHeader>
            <CardBody>
                {isLoading ? (
                    <div className="text-center py-8 text-default-500">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-8 text-default-500">
                        <Ticket size={40} className="mx-auto mb-3 opacity-50" />
                        <p>No coupons yet. Create your first discount!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {coupons.map((coupon) => {
                            const status = getCouponStatus(coupon);
                            return (
                                <div
                                    key={coupon.id}
                                    className="flex items-center justify-between p-4 bg-default-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <code className="font-bold text-lg">{coupon.code}</code>
                                            <Chip size="sm" color={status.color} variant="flat">
                                                {status.label}
                                            </Chip>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-default-500">
                                            <span className="flex items-center gap-1">
                                                {coupon.discountType === "PERCENTAGE" ? (
                                                    <><Percent size={14} /> {Number(coupon.discountValue)}% off</>
                                                ) : (
                                                    <><DollarSign size={14} /> ${Number(coupon.discountValue)} off</>
                                                )}
                                            </span>
                                            {coupon.minPurchase && (
                                                <span>Min: ${Number(coupon.minPurchase)}</span>
                                            )}
                                            {coupon.usageLimit && (
                                                <span>
                                                    Used: {coupon.usageCount}/{coupon.usageLimit}
                                                </span>
                                            )}
                                            {coupon.validUntil && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Expires: {new Date(coupon.validUntil).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        {coupon.description && (
                                            <p className="text-sm text-default-400 mt-1">{coupon.description}</p>
                                        )}
                                    </div>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        color="danger"
                                        onPress={() => handleDelete(coupon.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardBody>

            {/* Create Coupon Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Create New Coupon</ModalHeader>
                            <ModalBody className="space-y-4">
                                <Input
                                    label="Coupon Code"
                                    placeholder="e.g., SUMMER20"
                                    value={formData.code}
                                    onValueChange={(v) => setFormData({ ...formData, code: v.toUpperCase() })}
                                    isRequired
                                    description="Customers will enter this code at checkout"
                                />

                                <Textarea
                                    label="Description (optional)"
                                    placeholder="Internal notes about this coupon"
                                    value={formData.description}
                                    onValueChange={(v) => setFormData({ ...formData, description: v })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Discount Type"
                                        selectedKeys={[formData.discountType]}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] as "PERCENTAGE" | "FIXED";
                                            setFormData({ ...formData, discountType: value });
                                        }}
                                    >
                                        <SelectItem key="PERCENTAGE" startContent={<Percent size={16} />}>
                                            Percentage
                                        </SelectItem>
                                        <SelectItem key="FIXED" startContent={<DollarSign size={16} />}>
                                            Fixed Amount
                                        </SelectItem>
                                    </Select>

                                    <Input
                                        type="number"
                                        label="Discount Value"
                                        placeholder={formData.discountType === "PERCENTAGE" ? "e.g., 20" : "e.g., 10"}
                                        value={formData.discountValue}
                                        onValueChange={(v) => setFormData({ ...formData, discountValue: v })}
                                        isRequired
                                        endContent={
                                            <span className="text-default-400">
                                                {formData.discountType === "PERCENTAGE" ? "%" : "$"}
                                            </span>
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Minimum Purchase (optional)"
                                        placeholder="e.g., 50"
                                        value={formData.minPurchase}
                                        onValueChange={(v) => setFormData({ ...formData, minPurchase: v })}
                                        startContent={<span className="text-default-400">$</span>}
                                    />

                                    {formData.discountType === "PERCENTAGE" && (
                                        <Input
                                            type="number"
                                            label="Maximum Discount (optional)"
                                            placeholder="e.g., 50"
                                            value={formData.maxDiscount}
                                            onValueChange={(v) => setFormData({ ...formData, maxDiscount: v })}
                                            startContent={<span className="text-default-400">$</span>}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Usage Limit (optional)"
                                        placeholder="e.g., 100"
                                        value={formData.usageLimit}
                                        onValueChange={(v) => setFormData({ ...formData, usageLimit: v })}
                                        description="Leave empty for unlimited"
                                    />

                                    <Input
                                        type="date"
                                        label="Expiration Date (optional)"
                                        value={formData.validUntil}
                                        onValueChange={(v) => setFormData({ ...formData, validUntil: v })}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => handleCreate(onClose)}
                                    isLoading={isSubmitting}
                                >
                                    Create Coupon
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </Card>
    );
}

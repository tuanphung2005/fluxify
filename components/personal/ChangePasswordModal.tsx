"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@heroui/react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({
    isOpen,
    onClose,
}: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword =
                "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await api.patch("/api/user/password", formData);
            toast.success("Đổi mật khẩu thành công!");
            handleClose();
        } catch (error: any) {
            toast.error(error.message || "Không thể đổi mật khẩu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setErrors({});
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-primary" size={24} />
                        <span>Đổi mật khẩu</span>
                    </div>
                    <p className="text-sm text-default-500 font-normal">
                        Nhập mật khẩu hiện tại và mật khẩu mới của bạn
                    </p>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <Input
                            endContent={
                                <button
                                    className="focus:outline-none"
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="text-default-400" size={20} />
                                    ) : (
                                        <Eye className="text-default-400" size={20} />
                                    )}
                                </button>
                            }
                            errorMessage={errors.currentPassword}
                            isInvalid={!!errors.currentPassword}
                            label="Mật khẩu hiện tại"
                            placeholder="Nhập mật khẩu hiện tại"
                            startContent={<Lock className="text-default-400" size={18} />}
                            type={showCurrentPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onValueChange={(value) => handleChange("currentPassword", value)}
                        />

                        <Input
                            endContent={
                                <button
                                    className="focus:outline-none"
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="text-default-400" size={20} />
                                    ) : (
                                        <Eye className="text-default-400" size={20} />
                                    )}
                                </button>
                            }
                            errorMessage={errors.newPassword}
                            isInvalid={!!errors.newPassword}
                            label="Mật khẩu mới"
                            placeholder="Nhập mật khẩu mới"
                            startContent={<Lock className="text-default-400" size={18} />}
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onValueChange={(value) => handleChange("newPassword", value)}
                        />

                        <Input
                            endContent={
                                <button
                                    className="focus:outline-none"
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="text-default-400" size={20} />
                                    ) : (
                                        <Eye className="text-default-400" size={20} />
                                    )}
                                </button>
                            }
                            errorMessage={errors.confirmPassword}
                            isInvalid={!!errors.confirmPassword}
                            label="Xác nhận mật khẩu mới"
                            placeholder="Nhập lại mật khẩu mới"
                            startContent={<Lock className="text-default-400" size={18} />}
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onValueChange={(value) => handleChange("confirmPassword", value)}
                        />

                        <div className="text-xs text-default-400 space-y-1">
                            <p>Mật khẩu phải:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li>Có ít nhất 8 ký tự</li>
                                <li>Có ít nhất 1 chữ hoa</li>
                                <li>Có ít nhất 1 chữ thường</li>
                                <li>Có ít nhất 1 số</li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={handleClose}>
                        Hủy
                    </Button>
                    <Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
                        Đổi mật khẩu
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

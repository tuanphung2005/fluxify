"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Button, Input, Spinner } from "@heroui/react";
import { CheckCircle, XCircle, Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/api/api";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!email || !token) {
            setStatus("error");
            setMessage("Link đặt lại mật khẩu không hợp lệ.");
        } else {
            setStatus("form");
        }
    }, [email, token]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await api.patch("/api/user/password", {
                email,
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });
            setStatus("success");
            setMessage("Mật khẩu đã được đặt lại thành công!");
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const openLogin = () => router.push("/?modal=login", { scroll: false });

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardBody className="py-8 px-6">
                    {status === "loading" && (
                        <div className="flex flex-col items-center gap-4">
                            <Spinner size="lg" />
                            <p className="text-default-500">Đang tải...</p>
                        </div>
                    )}

                    {status === "form" && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="w-8 h-8 text-danger" />
                                </div>
                                <h1 className="text-xl font-semibold">Đặt lại mật khẩu</h1>
                                <p className="text-default-500 mt-2 text-sm">
                                    Nhập mật khẩu mới cho tài khoản của bạn
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
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
                                    type={showPassword ? "text" : "password"}
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
                                    label="Xác nhận mật khẩu"
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

                                <Button
                                    className="w-full"
                                    color="danger"
                                    isLoading={isSubmitting}
                                    type="submit"
                                >
                                    Đặt lại mật khẩu
                                </Button>
                            </form>
                        </>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-semibold text-success">Thành công!</h1>
                                <p className="text-default-500 mt-2">{message}</p>
                            </div>
                            <Button color="primary" onPress={openLogin}>
                                Đăng nhập ngay
                            </Button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-danger" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-semibold text-danger">Lỗi</h1>
                                <p className="text-default-500 mt-2">{message}</p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/">
                                    <Button variant="flat">Về trang chủ</Button>
                                </Link>
                                <Button color="primary" onPress={openLogin}>
                                    Đăng nhập
                                </Button>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardBody className="py-8 px-6">
                            <div className="flex flex-col items-center gap-4">
                                <Spinner size="lg" />
                                <p className="text-default-500">Đang tải...</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}

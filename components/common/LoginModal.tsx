"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Input,
    Link,
} from "@heroui/react";
import { ArrowLeft, Mail } from "lucide-react";

import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

export function LoginModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [view, setView] = useState<"login" | "forgot">("login");
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);

    const isOpen = searchParams.get("modal") === "login";

    const closeModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        router.push(`?${params.toString()}`, { scroll: false });
        // Reset state when closing
        setTimeout(() => {
            setView("login");
            setError("");
            setForgotEmail("");
            setResetSent(false);
        }, 200);
    };

    const switchToRegister = () => {
        setError("");
        const params = new URLSearchParams(searchParams.toString());
        params.set("modal", "register");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.code === "account_deactivated") {
                    setError(
                        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.",
                    );
                } else {
                    setError("Email hoặc mật khẩu không chính xác");
                }
            } else {
                closeModal();
                router.refresh();
            }
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!forgotEmail) {
            setError("Vui lòng nhập email");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/api/user/password", { email: forgotEmail }) as { cooldownRemaining?: number };

            if (response.cooldownRemaining) {
                setError(`Vui lòng đợi ${response.cooldownRemaining} giây trước khi gửi lại`);
            } else {
                setResetSent(true);
                toast.success("Link đặt lại mật khẩu đã được gửi!");
            }
        } catch {
            // Don't reveal if email exists or not for security
            setResetSent(true);
            toast.success("Nếu email tồn tại, link đặt lại mật khẩu sẽ được gửi!");
        } finally {
            setIsLoading(false);
        }
    };

    const backToLogin = () => {
        setView("login");
        setError("");
        setForgotEmail("");
        setResetSent(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={closeModal}>
            <ModalContent>
                {view === "login" ? (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center">
                            <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
                            <p className="text-sm text-default-500 font-normal">
                                Đăng nhập vào tài khoản của bạn
                            </p>
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <Input
                                    isRequired
                                    label="Email"
                                    name="email"
                                    placeholder="Nhập email của bạn"
                                    type="email"
                                    variant="bordered"
                                />
                                <Input
                                    isRequired
                                    label="Mật khẩu"
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    type="password"
                                    variant="bordered"
                                />

                                <div className="flex justify-end">
                                    <Link
                                        className="cursor-pointer text-sm"
                                        size="sm"
                                        onPress={() => setView("forgot")}
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                {error && (
                                    <p className="text-danger text-sm text-center">{error}</p>
                                )}

                                <Button
                                    className="w-full"
                                    color="primary"
                                    isLoading={isLoading}
                                    type="submit"
                                >
                                    Đăng nhập
                                </Button>

                                <div className="text-center text-sm">
                                    Chưa có tài khoản?{" "}
                                    <Link className="cursor-pointer" size="sm" onPress={switchToRegister}>
                                        Đăng ký
                                    </Link>
                                </div>
                            </form>
                        </ModalBody>
                    </>
                ) : (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center">
                            <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
                            <p className="text-sm text-default-500 font-normal text-center">
                                Nhập email để nhận link đặt lại mật khẩu
                            </p>
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            {resetSent ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-success" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Email đã được gửi!</p>
                                        <p className="text-sm text-default-500 mt-1">
                                            Kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full mt-2"
                                        variant="flat"
                                        startContent={<ArrowLeft size={16} />}
                                        onPress={backToLogin}
                                    >
                                        Quay lại đăng nhập
                                    </Button>
                                </div>
                            ) : (
                                <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
                                    <Input
                                        isRequired
                                        label="Email"
                                        placeholder="Nhập email của bạn"
                                        type="email"
                                        variant="bordered"
                                        value={forgotEmail}
                                        onValueChange={setForgotEmail}
                                    />

                                    {error && (
                                        <p className="text-danger text-sm text-center">{error}</p>
                                    )}

                                    <Button
                                        className="w-full"
                                        color="primary"
                                        isLoading={isLoading}
                                        type="submit"
                                    >
                                        Gửi link đặt lại mật khẩu
                                    </Button>

                                    <Button
                                        className="w-full"
                                        variant="flat"
                                        startContent={<ArrowLeft size={16} />}
                                        onPress={backToLogin}
                                    >
                                        Quay lại đăng nhập
                                    </Button>
                                </form>
                            )}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

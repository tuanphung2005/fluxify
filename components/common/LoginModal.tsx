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

export function LoginModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const isOpen = searchParams.get("modal") === "login";

    const closeModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        router.push(`?${params.toString()}`, { scroll: false });
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

    return (
        <Modal isOpen={isOpen} onClose={closeModal}>
            <ModalContent>
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
            </ModalContent>
        </Modal>
    );
}

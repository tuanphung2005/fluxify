"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Input,
    Link,
    RadioGroup,
    Radio,
} from "@heroui/react";

export function RegisterModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState("CUSTOMER");

    const isOpen = searchParams.get("modal") === "register";

    const closeModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const switchToLogin = () => {
        setError("");
        const params = new URLSearchParams(searchParams.toString());
        params.set("modal", "login");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const name = formData.get("name") as string;

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Đã xảy ra lỗi");
                setIsLoading(false);
                return;
            }

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(
                    "Tài khoản đã tạo thành công nhưng đăng nhập thất bại. Vui lòng thử đăng nhập lại.",
                );
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
                    <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                    <p className="text-sm text-default-500 font-normal">
                        Đăng ký để mua sắm hoặc bán hàng
                    </p>
                </ModalHeader>
                <ModalBody className="pb-6">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <Input
                            isRequired
                            label="Họ và tên"
                            name="name"
                            placeholder="Nhập tên của bạn"
                            type="text"
                            variant="bordered"
                        />
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
                            placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                            type="password"
                            variant="bordered"
                        />

                        <RadioGroup
                            label="Tôi muốn:"
                            orientation="horizontal"
                            value={role}
                            onValueChange={setRole}
                        >
                            <Radio value="CUSTOMER">Mua sắm</Radio>
                            <Radio value="VENDOR">Bán hàng</Radio>
                        </RadioGroup>

                        {error && (
                            <p className="text-danger text-sm text-center">{error}</p>
                        )}

                        <Button
                            className="w-full"
                            color="primary"
                            isLoading={isLoading}
                            type="submit"
                        >
                            Tạo tài khoản
                        </Button>

                        <div className="text-center text-sm">
                            Bạn đã có tài khoản?{" "}
                            <Link className="cursor-pointer" size="sm" onPress={switchToLogin}>
                                Đăng nhập
                            </Link>
                        </div>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

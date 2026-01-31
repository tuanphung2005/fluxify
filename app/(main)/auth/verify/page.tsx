"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!email || !token) {
                setStatus("error");
                setMessage("Link xác thực không hợp lệ. Vui lòng kiểm tra lại email.");
                return;
            }

            try {
                const response = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage("Email của bạn đã được xác thực thành công!");
                } else {
                    setStatus("error");
                    setMessage(data.error || "Xác thực thất bại. Link có thể đã hết hạn.");
                }
            } catch {
                setStatus("error");
                setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        };

        verifyEmail();
    }, [email, token]);

    const openLogin = () => router.push("/?modal=login", { scroll: false });

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardBody className="flex flex-col items-center gap-6 py-8">
                    {status === "loading" && (
                        <>
                            <Spinner size="lg" />
                            <div className="text-center">
                                <h1 className="text-xl font-semibold">Đang xác thực email...</h1>
                                <p className="text-default-500 mt-2">Vui lòng đợi trong giây lát</p>
                            </div>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-semibold text-success">Xác thực thành công!</h1>
                                <p className="text-default-500 mt-2">{message}</p>
                            </div>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-danger" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-semibold text-danger">Xác thực thất bại</h1>
                                <p className="text-default-500 mt-2">{message}</p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/">
                                    <Button variant="flat">Về trang chủ</Button>
                                </Link>
                                <Button
                                    color="primary"
                                    startContent={<Mail className="w-4 h-4" />}
                                    onPress={openLogin}
                                >
                                    Đăng nhập
                                </Button>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardBody className="flex flex-col items-center gap-6 py-8">
                            <Spinner size="lg" />
                            <div className="text-center">
                                <h1 className="text-xl font-semibold">Đang xác thực email...</h1>
                                <p className="text-default-500 mt-2">Vui lòng đợi trong giây lát</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}

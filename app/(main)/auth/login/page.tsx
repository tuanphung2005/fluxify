"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Link, Card, CardBody, CardHeader } from "@heroui/react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        // Check for account deactivation error (custom error code from auth.ts)
        if (result.code === "account_deactivated") {
          setError(
            "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.",
          );
        } else {
          setError("Email hoặc mật khẩu không chính xác");
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
          <p className="text-sm text-default-500">
            Đăng nhập vào tài khoản của bạn
          </p>
        </CardHeader>
        <CardBody>
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
              <Link href="/auth/register" size="sm">
                Đăng ký
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Button,
  Input,
  Link,
  Card,
  CardBody,
  CardHeader,
  RadioGroup,
  Radio,
} from "@heroui/react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("CUSTOMER");

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

      // Auto sign in after registration
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
          <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-sm text-default-500">
            Đăng ký để mua sắm hoặc bán hàng
          </p>
        </CardHeader>
        <CardBody>
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
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
              <Link href="/auth/login" size="sm">
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

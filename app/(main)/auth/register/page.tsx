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
        setError(data.error || "Something went wrong");
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
        setError("Account created but sign in failed. Please try logging in.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-default-500">
            Sign up to start shopping or selling
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              isRequired
              label="Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              variant="bordered"
            />
            <Input
              isRequired
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              variant="bordered"
            />
            <Input
              isRequired
              label="Password"
              name="password"
              placeholder="Enter your password (min. 6 characters)"
              variant="bordered"
              type="password"
            />

            <RadioGroup
              label="I want to:"
              value={role}
              onValueChange={setRole}
              orientation="horizontal"
            >
              <Radio value="CUSTOMER">Shop</Radio>
              <Radio value="VENDOR">Sell Products</Radio>
            </RadioGroup>

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" size="sm">
                Sign in
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

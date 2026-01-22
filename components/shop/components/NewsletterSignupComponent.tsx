"use client";

import type { NewsletterSignupConfig } from "@/types/shop";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Mail, CheckCircle } from "lucide-react";
import { addToast } from "@heroui/toast";

interface NewsletterSignupComponentProps {
  config: NewsletterSignupConfig;
}

export default function NewsletterSignupComponent({
  config,
}: NewsletterSignupComponentProps) {
  const {
    title,
    subtitle,
    buttonText = "Đăng ký",
    placeholder = "Nhập email của bạn",
    backgroundColor,
    textColor,
  } = config;

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      addToast({ title: "Vui lòng nhập email hợp lệ", color: "warning" });

      return;
    }

    setIsSubmitting(true);

    // Simulate API call - in real implementation, connect to email service
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubscribed(true);
    addToast({ title: "Đăng ký thành công!", color: "success" });
  };

  return (
    <section
      className="py-16 px-4"
      style={{
        backgroundColor: backgroundColor || "#f8fafc",
        color: textColor || "inherit",
      }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="mx-auto mb-6 text-primary" size={48} />

        <h2 className="text-3xl font-bold mb-4">{title}</h2>

        {subtitle && (
          <p className="text-lg text-default-600 mb-8">{subtitle}</p>
        )}

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 text-success">
            <CheckCircle size={24} />
            <span className="text-lg font-medium">Cảm ơn bạn đã đăng ký!</span>
          </div>
        ) : (
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={handleSubmit}
          >
            <Input
              classNames={{
                inputWrapper: "bg-white shadow-sm",
              }}
              placeholder={placeholder}
              size="lg"
              startContent={<Mail className="text-default-400" size={18} />}
              type="email"
              value={email}
              onValueChange={setEmail}
            />
            <Button
              className="px-8"
              color="primary"
              isLoading={isSubmitting}
              size="lg"
              type="submit"
            >
              {buttonText}
            </Button>
          </form>
        )}

        <p className="text-sm text-default-400 mt-4">
          Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc
          nào.
        </p>
      </div>
    </section>
  );
}

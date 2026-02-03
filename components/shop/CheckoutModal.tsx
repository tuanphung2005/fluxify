"use client";

import { z } from "zod";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { CheckCircle, QrCode, AlertCircle, Maximize2, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";

import { useCartStore } from "@/store/cart-store";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";
import {
  generateVietQRUrl,
  getBankByCode,
  hasPaymentConfigured,
  type VietQRBank,
} from "@/lib/vietqr";
import { phoneSchema, emailSchema } from "@/lib/validations";

interface VendorPaymentInfo {
  bankId: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function CheckoutModal({
  isOpen,
  onOpenChange,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  const { getItems, total, clearCart, currentVendorId, currentVendorName } =
    useCartStore();
  const items = getItems();
  const [step, setStep] = useState<"details" | "payment" | "success">(
    "details",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [vendorPayment, setVendorPayment] = useState<VendorPaymentInfo | null>(
    null,
  );
  const [bankInfo, setBankInfo] = useState<VietQRBank | undefined>(undefined);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Việt Nam",
  });
  const [saveDetails, setSaveDetails] = useState(false);

  // Fetch vendor payment info and check email verification when modal opens
  useEffect(() => {
    if (isOpen && currentVendorId) {
      fetchVendorPayment();
      checkEmailVerification();

      // Load saved buyer details from localStorage
      const saved = localStorage.getItem("fluxify-buyer-details");

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          setFormData((prev) => ({
            ...prev,
            fullName: parsed.fullName || "",
            phoneNumber: parsed.phoneNumber || "",
            email: parsed.email || "",
            street: parsed.street || "",
            city: parsed.city || "",
            state: parsed.state || "",
            zipCode: parsed.zipCode || "",
            country: parsed.country || "Việt Nam",
          }));
          setSaveDetails(true);
        } catch (e) {
          console.error("Failed to load saved details", e);
        }
      }
    }
  }, [isOpen, currentVendorId]);

  const checkEmailVerification = async () => {
    try {
      const data = await api.get<{ user: { emailVerified: string | null } }>("/api/user/personal");
      setIsEmailVerified(!!data.user.emailVerified);
    } catch (error) {
      // If not logged in or error, assume not verified
      setIsEmailVerified(false);
    }
  };

  const fetchVendorPayment = async () => {
    try {
      const data = (await api.get(
        `/api/shop/${currentVendorId}/payment`,
      )) as VendorPaymentInfo;

      setVendorPayment(data);
      if (data?.bankId) {
        const bank = await getBankByCode(data.bankId);

        setBankInfo(bank);
      }
    } catch (error) {
      console.error("Failed to fetch vendor payment info:", error);
      setVendorPayment(null);
    }
  };

  const handleProceedToPayment = async () => {
    // Full name validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      toast.error("Vui lòng nhập họ tên đầy đủ");

      return;
    }

    // Phone validation (Vietnamese format)
    const phoneResult = phoneSchema.safeParse(formData.phoneNumber.replace(/\s/g, ""));
    if (!phoneResult.success) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)");
      return;
    }

    // Email validation
    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }

    if (!formData.street || !formData.city) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");

      return;
    }

    // Save details if checkbox is checked
    if (saveDetails) {
      localStorage.setItem(
        "fluxify-buyer-details",
        JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        }),
      );
    } else {
      localStorage.removeItem("fluxify-buyer-details");
    }

    setIsLoading(true);
    try {
      const result = (await api.post("/api/orders", {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          selectedVariant: item.selectedVariant,
        })),
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state || formData.city,
          zipCode: formData.zipCode || "000000",
          country: formData.country || "Việt Nam",
        },
      })) as { id?: string };

      setOrderId(result.id || Date.now().toString().slice(-8));
      setStep("payment");
    } catch (error: any) {
      console.error("Order creation failed:", error);
      toast.error(
        error.message ||
        "Không thể tạo đơn hàng. Một số sản phẩm có thể đã hết hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    // Send receipt email (fire-and-forget)
    if (orderId) {
      fetch(`/api/orders/${orderId}/receipt`, { method: "POST" }).catch((err) =>
        console.error("Failed to send receipt:", err)
      );
    }
    clearCart();
    setStep("success");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset step after animation
    setTimeout(() => {
      setStep("details");
      setOrderId("");
      if (!saveDetails) {
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Việt Nam",
        });
      }
    }, 300);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasVendorPayment = vendorPayment && hasPaymentConfigured(vendorPayment);

  // Generate VietQR URL
  const qrUrl = hasVendorPayment
    ? generateVietQRUrl({
      bankId: vendorPayment.bankId!,
      accountNo: vendorPayment.bankAccount!,
      accountName: vendorPayment.bankAccountName!,
      amount: Math.max(1000, Math.round(total())), // Ensure minimum 1000 VND
      description: `DH${orderId}`,
    })
    : null;

  return (
    <>
      <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {step === "details" && "Thanh toán"}
                {step === "payment" && "Chuyển khoản ngân hàng"}
                {step === "success" && "Đặt hàng thành công"}
              </ModalHeader>
              <ModalBody>
                {step === "details" && (
                  <div className="space-y-4">
                    {/* Email verification warning */}
                    {isEmailVerified === false && (
                      <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="text-danger flex-shrink-0 mt-0.5" size={20} />
                          <div className="flex-1">
                            <p className="font-medium text-danger-700 dark:text-danger-400">
                              Email chưa được xác thực
                            </p>
                            <p className="text-sm text-danger-600 dark:text-danger-500 mt-1">
                              Vui lòng xác thực email trước khi mua hàng.{" "}
                              <Link href="/order" className="underline font-medium">
                                Xác thực ngay
                              </Link>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-default-50 rounded-lg">
                      <div className="flex justify-between font-semibold">
                        <span>Tổng tiền</span>
                        <span>{total().toLocaleString("vi-VN")}₫</span>
                      </div>
                      {currentVendorName && (
                        <p className="text-sm text-default-500 mt-1">
                          Mua từ: {currentVendorName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        isRequired
                        label="Họ và tên"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onValueChange={(v) => handleChange("fullName", v)}
                      />
                      <Input
                        isRequired
                        label="Số điện thoại"
                        placeholder="0987654321"
                        type="tel"
                        value={formData.phoneNumber}
                        onValueChange={(v) => handleChange("phoneNumber", v)}
                      />
                      <Input
                        isRequired
                        label="Email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onValueChange={(v) => handleChange("email", v)}
                      />
                      <Input
                        isRequired
                        label="Địa chỉ"
                        placeholder="Số nhà, đường, phường/xã"
                        value={formData.street}
                        onValueChange={(v) => handleChange("street", v)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Quận/Huyện"
                          placeholder="Quận 1"
                          value={formData.state}
                          onValueChange={(v) => handleChange("state", v)}
                        />
                        <Input
                          isRequired
                          label="Thành phố"
                          placeholder="TP. Hồ Chí Minh"
                          value={formData.city}
                          onValueChange={(v) => handleChange("city", v)}
                        />
                      </div>
                    </div>

                    {!hasVendorPayment && (
                      <div className="flex items-center gap-2 p-3 bg-warning-50 text-warning-700 rounded-lg">
                        <AlertCircle size={20} />
                        <p className="text-sm">
                          Cửa hàng chưa cài đặt phương thức thanh toán.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        checked={saveDetails}
                        className="w-4 h-4 text-primary bg-default-100 border-default-300 rounded focus:ring-primary"
                        id="save-details"
                        type="checkbox"
                        onChange={(e) => setSaveDetails(e.target.checked)}
                      />
                      <label
                        className="text-sm text-default-600 cursor-pointer"
                        htmlFor="save-details"
                      >
                        Lưu thông tin cho lần mua sau
                      </label>
                    </div>
                  </div>
                )}

                {step === "payment" && hasVendorPayment && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-default-500">
                        Quét mã QR để thanh toán
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {total().toLocaleString("vi-VN")}₫
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      {qrUrl && (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => setIsZoomOpen(true)}
                        >
                          <img
                            alt="VietQR Payment Code"
                            className="w-64 h-auto"
                            src={qrUrl}
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Button
                              isIconOnly
                              className="bg-white/90 backdrop-blur-sm shadow-md"
                              size="sm"
                              variant="flat"
                              onPress={() => setIsZoomOpen(true)}
                            >
                              <Maximize2 size={16} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full p-4 bg-default-50 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-500">Ngân hàng:</span>
                        <span className="font-medium">
                          {bankInfo?.shortName || vendorPayment.bankId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Số tài khoản:</span>
                        <span className="font-medium font-mono">
                          {vendorPayment.bankAccount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Chủ tài khoản:</span>
                        <span className="font-medium">
                          {vendorPayment.bankAccountName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Nội dung CK:</span>
                        <span className="font-medium font-mono">
                          DH{orderId}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-default-400 text-center">
                      Sau khi chuyển khoản thành công, nhấn &quot;Đã thanh
                      toán&quot; để hoàn tất đơn hàng.
                    </p>
                  </div>
                )}

                {step === "success" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-success" />
                    <div>
                      <h3 className="text-xl font-bold">
                        Cảm ơn bạn đã đặt hàng!
                      </h3>
                      <p className="text-default-500">
                        Đơn hàng #{orderId} đã được ghi nhận.
                      </p>
                      <p className="text-sm text-default-400 mt-2">
                        Email xác nhận đã được gửi đến {formData.email}
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {step === "details" && (
                  <>
                    <Button variant="light" onPress={onClose}>
                      Hủy
                    </Button>
                    <Button
                      color="primary"
                      isDisabled={!hasVendorPayment || isEmailVerified === false}
                      isLoading={isLoading}
                      startContent={!isLoading && <QrCode size={18} />}
                      onPress={handleProceedToPayment}
                    >
                      {isEmailVerified === false ? "Xác thực email để mua" : "Tiếp tục thanh toán"}
                    </Button>
                  </>
                )}
                {step === "payment" && (
                  <>
                    <Button variant="light" onPress={() => setStep("details")}>
                      Quay lại
                    </Button>
                    <Button color="success" onPress={handleConfirmPayment}>
                      Đã thanh toán
                    </Button>
                  </>
                )}
                {step === "success" && (
                  <Button color="primary" onPress={handleClose}>
                    Đóng
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <ModalContent>
          {(onClose) => (
            <ModalBody className="flex items-center justify-center p-4 bg-default-100">
              {qrUrl && (
                <img
                  alt="VietQR Full Size"
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  src={qrUrl}
                />
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

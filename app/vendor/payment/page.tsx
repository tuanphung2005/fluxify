"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { Avatar } from "@heroui/avatar";
import { CreditCard, QrCode, Check } from "lucide-react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";
import { generateVietQRUrl, removeVietnameseDiacritics, fetchVietQRBanks, type VietQRBank } from "@/lib/vietqr";
import VendorLayout from "@/components/vendor/VendorLayout";

interface PaymentSettings {
    bankId: string | null;
    bankAccount: string | null;
    bankAccountName: string | null;
}

export default function PaymentSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [banks, setBanks] = useState<VietQRBank[]>([]);
    const [formData, setFormData] = useState({
        bankId: "",
        bankAccount: "",
        bankAccountName: "",
    });

    useEffect(() => {
        Promise.all([fetchPaymentSettings(), loadBanks()]);
    }, []);

    const loadBanks = async () => {
        const bankList = await fetchVietQRBanks();
        setBanks(bankList);
    };

    const fetchPaymentSettings = async () => {
        try {
            const data: PaymentSettings = await api.get("/api/vendor/payment");
            setFormData({
                bankId: data.bankId || "",
                bankAccount: data.bankAccount || "",
                bankAccountName: data.bankAccountName || "",
            });
        } catch (error) {
            console.error("Failed to fetch payment settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.bankId || !formData.bankAccount || !formData.bankAccountName) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (!/^\d+$/.test(formData.bankAccount)) {
            toast.error("Số tài khoản chỉ được chứa số");
            return;
        }

        setIsSaving(true);
        try {
            await api.put("/api/vendor/payment", {
                bankId: formData.bankId,
                bankAccount: formData.bankAccount,
                bankAccountName: removeVietnameseDiacritics(formData.bankAccountName).toUpperCase(),
            });
            toast.success("Lưu thông tin thanh toán thành công");
        } catch (error: any) {
            toast.error(error.message || "Không thể lưu thông tin thanh toán");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const hasValidSettings = formData.bankId && formData.bankAccount && formData.bankAccountName;

    // Generate preview QR URL
    const previewQrUrl = hasValidSettings
        ? generateVietQRUrl({
            bankId: formData.bankId,
            accountNo: formData.bankAccount,
            accountName: removeVietnameseDiacritics(formData.bankAccountName).toUpperCase(),
            amount: 100000,
            description: "PREVIEW",
        })
        : null;

    const selectedBank = banks.find(b => b.code === formData.bankId);

    if (isLoading) {
        return (
            <VendorLayout>
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="text-primary" />
                        Cài đặt thanh toán
                    </h1>
                    <p className="text-default-500 mt-1">
                        Cấu hình thông tin ngân hàng để nhận thanh toán từ khách hàng qua VietQR
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form Card */}
                    <Card>
                        <CardHeader className="pb-0">
                            <h2 className="text-lg font-semibold">Thông tin tài khoản ngân hàng</h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Autocomplete
                                label="Ngân hàng"
                                placeholder="Tìm kiếm ngân hàng..."
                                defaultItems={banks}
                                selectedKey={formData.bankId || null}
                                onSelectionChange={(key) => handleChange("bankId", key as string || "")}
                                isRequired
                                isLoading={banks.length === 0}
                                listboxProps={{
                                    emptyContent: "Không tìm thấy ngân hàng",
                                }}
                            >
                                {(bank) => (
                                    <AutocompleteItem
                                        key={bank.code}
                                        textValue={`${bank.shortName} ${bank.name}`}
                                        startContent={
                                            <Avatar
                                                src={bank.logo}
                                                alt={bank.shortName}
                                                size="sm"
                                                radius="sm"
                                                className="w-8 h-8 bg-white"
                                            />
                                        }
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{bank.shortName}</span>
                                            <span className="text-xs text-default-400 line-clamp-1">{bank.name}</span>
                                        </div>
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>

                            <Input
                                label="Số tài khoản"
                                placeholder="Nhập số tài khoản"
                                value={formData.bankAccount}
                                onValueChange={(v) => handleChange("bankAccount", v)}
                                isRequired
                                classNames={{
                                    input: "font-mono"
                                }}
                            />

                            <Input
                                label="Tên chủ tài khoản"
                                placeholder="VD: NGUYEN VAN AN"
                                value={formData.bankAccountName}
                                onValueChange={(v) => handleChange("bankAccountName", v)}
                                description="Tên sẽ được chuyển sang in hoa, không dấu"
                                isRequired
                            />

                            <Divider />

                            <Button
                                color="primary"
                                onPress={handleSave}
                                isLoading={isSaving}
                                startContent={!isSaving && <Check size={18} />}
                                className="w-full"
                            >
                                Lưu thông tin
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Preview Card */}
                    <Card>
                        <CardHeader className="pb-0">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <QrCode size={20} />
                                Xem trước mã QR
                            </h2>
                        </CardHeader>
                        <CardBody className="flex flex-col items-center justify-center space-y-4">
                            {hasValidSettings ? (
                                <>
                                    <div className="bg-white p-4 rounded-xl shadow-lg">
                                        <img
                                            src={previewQrUrl!}
                                            alt="VietQR Preview"
                                            className="w-48 h-53"
                                        />
                                    </div>
                                    <p className="text-xs text-success text-center">
                                        ✓ Khách hàng sẽ thấy mã QR này khi thanh toán
                                    </p>
                                </>
                            ) : (
                                <div className="text-center text-default-400 py-8">
                                    <QrCode size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>Điền đầy đủ thông tin để xem trước mã QR</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </VendorLayout>
    );
}

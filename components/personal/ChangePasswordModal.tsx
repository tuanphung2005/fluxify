"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";
import { Mail, ShieldCheck, CheckCircle } from "lucide-react";

import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
}

export default function ChangePasswordModal({
    isOpen,
    onClose,
    userEmail,
}: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSendResetLink = async () => {
        setIsLoading(true);
        try {
            await api.post("/api/user/password", { email: userEmail });
            setIsSent(true);
            toast.success("Link đặt lại mật khẩu đã được gửi!");
        } catch (error: any) {
            toast.error(error.message || "Không thể gửi email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsSent(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-danger" size={24} />
                        <span>Đổi mật khẩu</span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    {isSent ? (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Email đã được gửi!</p>
                                <p className="text-sm text-default-500 mt-2">
                                    Kiểm tra hộp thư <strong>{userEmail}</strong> để nhận link đặt lại mật khẩu.
                                </p>
                                <p className="text-xs text-default-400 mt-2">
                                    Link sẽ hết hạn sau 1 giờ.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-default-600">
                                Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn:
                            </p>
                            <div className="p-3 bg-default-100 rounded-lg flex items-center gap-3">
                                <Mail className="text-default-500" size={20} />
                                <span className="font-medium">{userEmail}</span>
                            </div>
                            <p className="text-sm text-default-500">
                                Nhấn vào link trong email để tạo mật khẩu mới. Link sẽ hết hạn sau 1 giờ.
                            </p>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {isSent ? (
                        <Button color="primary" onPress={handleClose}>
                            Đóng
                        </Button>
                    ) : (
                        <>
                            <Button variant="flat" onPress={handleClose}>
                                Hủy
                            </Button>
                            <Button
                                color="danger"
                                isLoading={isLoading}
                                startContent={!isLoading && <Mail size={16} />}
                                onPress={handleSendResetLink}
                            >
                                Gửi link đặt lại
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

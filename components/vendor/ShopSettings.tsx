"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useState } from "react";

import ImageBuilder from "@/components/vendor/ImageBuilder";
import { api } from "@/lib/api/api";

interface ShopSettingsProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentStoreName: string;
  currentFavicon?: string;
  onUpdate: () => void;
}

export default function ShopSettings({
  isOpen,
  onOpenChange,
  currentStoreName,
  currentFavicon,
  onUpdate,
}: ShopSettingsProps) {
  const [storeName, setStoreName] = useState(currentStoreName);
  const [favicon, setFavicon] = useState(currentFavicon || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      await api.patch("/api/vendor/profile", {
        storeName,
        favicon: favicon || undefined,
      });
      onUpdate();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật cài đặt cửa hàng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Cài đặt cửa hàng</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  isRequired
                  label="Tên cửa hàng"
                  value={storeName}
                  onValueChange={setStoreName}
                />

                <div className="flex flex-col gap-2">
                  <span className="text-small font-medium text-foreground">Favicon cửa hàng</span>
                  <span className="text-tiny text-default-500 mb-1">
                    Biểu tượng nhỏ hiển thị trên tab trình duyệt (tỷ lệ 1:1)
                  </span>
                  <ImageBuilder
                    value={favicon}
                    onChange={(val) => {
                      // ImageBuilder returns newline separated strings, take the first one or empty string
                      const urls = val.split("\n").filter(Boolean);
                      setFavicon(urls.length > 0 ? urls[0] : "");
                    }}
                  />
                </div>

                {error && <p className="text-danger text-sm">{error}</p>}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                isDisabled={isLoading}
                variant="light"
                onPress={onClose}
              >
                Hủy
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                onPress={handleSave}
              >
                Lưu
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

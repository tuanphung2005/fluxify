"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
} from "@heroui/react";
import { useState } from "react";
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
            setError(err.message || "Failed to update shop settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Shop Settings</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Store Name"
                                    value={storeName}
                                    onValueChange={setStoreName}
                                    isRequired
                                />
                                <Input
                                    label="Favicon URL"
                                    value={favicon}
                                    onValueChange={setFavicon}
                                    placeholder="https://example.com/favicon.ico"
                                />
                                {error && (
                                    <p className="text-danger text-sm">{error}</p>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="default"
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSave}
                                isLoading={isLoading}
                            >
                                Save
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

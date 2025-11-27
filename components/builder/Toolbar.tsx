"use client";

import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/react";
import { Save, Eye, Upload, Undo2, Package, Settings } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import ProductManager from "@/components/vendor/ProductManager";
import ShopSettings from "@/components/vendor/ShopSettings";

interface BuilderToolbarProps {
    templateName: string;
    isPublished: boolean;
    isOperating: boolean;
    hasUnsavedChanges: boolean;
    favicon?: string;
    onSave: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onPreview: () => void;
    onProductsChange?: () => void;
    onProfileUpdate?: () => void;
}

export default function BuilderToolbar({
    templateName,
    isPublished,
    isOperating,
    hasUnsavedChanges,
    favicon,
    onSave,
    onPublish,
    onUnpublish,
    onPreview,
    onProductsChange,
    onProfileUpdate,
}: BuilderToolbarProps) {
    const {
        isOpen: isUnpublishModalOpen,
        onOpen: onUnpublishModalOpen,
        onClose: onUnpublishModalClose,
        onOpenChange: onUnpublishModalOpenChange,
    } = useDisclosure();
    const productsModal = useDisclosure();
    const settingsModal = useDisclosure();

    const handleUnpublishConfirm = () => {
        onUnpublish();
        onUnpublishModalClose();
    };

    return (
        <>
            <div className="h-16 bg-content1 border-b border-divider px-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">{templateName}</h2>
                    <p className="text-xs text-default-500">
                        {isPublished ? "published" : "draft"}
                        {hasUnsavedChanges && (
                            <span className="ml-2 text-warning">• unsaved changes</span>
                        )}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="flat"
                        startContent={<Package />}
                        onPress={productsModal.onOpen}
                        radius="none"
                    >
                        products
                    </Button>
                    <Button
                        variant="flat"
                        startContent={<Settings />}
                        onPress={settingsModal.onOpen}
                        radius="none"
                    >
                        settings
                    </Button>
                    <Button
                        variant="flat"
                        startContent={<Eye />}
                        onPress={onPreview}
                        radius="none"
                    >
                        preview
                    </Button>
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Save />}
                        onPress={onSave}
                        isLoading={isOperating}
                        isDisabled={!hasUnsavedChanges}
                        radius="none"
                    >
                        {hasUnsavedChanges ? "save" : "saved"}
                    </Button>
                    <Button
                        color="success"
                        startContent={<Upload />}
                        onPress={onPublish}
                        isLoading={isOperating}
                        isDisabled={isOperating}
                        radius="none"
                    >
                        {isPublished ? "update" : "publish"}
                    </Button>
                    {isPublished && (
                        <Button
                            color="warning"
                            variant="flat"
                            onPress={onUnpublishModalOpen}
                            isLoading={isOperating}
                            isDisabled={isOperating}
                            radius="none"
                            startContent={<Undo2 />}
                        >
                            unpublish
                        </Button>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isUnpublishModalOpen}
                onOpenChange={onUnpublishModalOpenChange}
                title="Unpublish Shop"
                description="Are you sure you want to unpublish your shop? This will make your shop inaccessible to customers."
                confirmText="Unpublish"
                variant="warning"
                onConfirm={handleUnpublishConfirm}
                isLoading={isOperating}
            />

            <ProductManager
                isOpen={productsModal.isOpen}
                onOpenChange={productsModal.onOpenChange}
                onProductsChange={onProductsChange || (() => { })}
            />

            <ShopSettings
                isOpen={settingsModal.isOpen}
                onOpenChange={settingsModal.onOpenChange}
                currentStoreName={templateName}
                currentFavicon={favicon}
                onUpdate={onProfileUpdate || (() => { })}
            />
        </>
    );
}

"use client";

import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

import ComponentPalette from "@/components/builder/ComponentPalette";
import BuilderCanvas from "@/components/builder/Canvas";
import ConfigurationPanel from "@/components/builder/ConfigurationPanel";
import BuilderToolbar from "@/components/builder/Toolbar";
import { useShopBuilder } from "@/hooks/useShopBuilder";

export default function ShopBuilderPage() {
  const {
    template,
    components,
    selectedComponentId,
    isLoading,
    isOperating,
    hasUnsavedChanges,
    error,
    needsEmailVerification,
    setSelectedComponentId,
    addComponent,
    updateComponentConfig,
    deleteComponent,
    reorderComponents,
    saveChanges,
    publishShop,
    unpublishShop,
    previewShop,
    refetchProducts,
  } = useShopBuilder();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show email verification prompt
  if (needsEmailVerification) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardBody className="text-center py-10 px-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-warning-600" />
            </div>
            <h2 className="text-xl font-semibold">Xác thực email để tiếp tục</h2>
            <p className="text-default-500">
              Bạn cần xác thực email trước khi sử dụng Shop Builder. Vui lòng kiểm tra hộp thư của bạn hoặc đi đến trang tài khoản để gửi lại email xác thực.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                as={Link}
                href="/personal"
                color="primary"
                startContent={<Mail size={16} />}
              >
                Đi đến trang tài khoản
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Show generic error
  if (error && !needsEmailVerification) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardBody className="text-center py-10 px-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-danger-600" />
            </div>
            <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
            <p className="text-default-500">{error}</p>
            <Button
              color="primary"
              onPress={() => window.location.reload()}
            >
              Thử lại
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const selectedComponent = components.find(
    (c) => c.id === selectedComponentId,
  );

  return (
    <div className="fixed inset-0 top-16 z-40 bg-background">
      <BuilderToolbar
        hasUnsavedChanges={hasUnsavedChanges}
        isOperating={isOperating}
        isPublished={template?.isPublished || false}
        templateName={
          template?.vendor?.storeName || template?.name || "cửa hàng của tôi"
        }
        onPreview={previewShop}
        onProductsChange={refetchProducts}
        onProfileUpdate={() => window.location.reload()}
        onPublish={publishShop}
        onSave={saveChanges}
        onUnpublish={unpublishShop}
      />
      <div className="flex h-[calc(100%-4rem)]">
        <ComponentPalette onSelectComponent={addComponent} />
        <BuilderCanvas
          components={components}
          selectedComponentId={selectedComponentId}
          onDeleteComponent={deleteComponent}
          onReorderComponents={reorderComponents}
          onSelectComponent={setSelectedComponentId}
        />
        <ConfigurationPanel
          componentType={selectedComponent?.type || null}
          config={selectedComponent?.config || null}
          onUpdateConfig={updateComponentConfig}
        />
      </div>
    </div>
  );
}

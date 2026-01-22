"use client";

import { Spinner } from "@heroui/spinner";

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

"use client";

import ComponentPalette from "@/components/builder/ComponentPalette";
import BuilderCanvas from "@/components/builder/Canvas";
import ConfigurationPanel from "@/components/builder/ConfigurationPanel";
import BuilderToolbar from "@/components/builder/Toolbar";
import { Spinner } from "@heroui/spinner";
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

    const selectedComponent = components.find((c) => c.id === selectedComponentId);

    return (
        <div className="fixed inset-0 top-16 z-40 bg-background">
            <BuilderToolbar
                templateName={template?.vendor?.storeName || template?.name || "cửa hàng của tôi"}
                isPublished={template?.isPublished || false}
                isOperating={isOperating}
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={saveChanges}
                onPublish={publishShop}
                onUnpublish={unpublishShop}
                onPreview={previewShop}
                onProductsChange={refetchProducts}
                onProfileUpdate={() => window.location.reload()}
            />
            <div className="flex h-[calc(100%-4rem)]">
                <ComponentPalette onSelectComponent={addComponent} />
                <BuilderCanvas
                    components={components}
                    selectedComponentId={selectedComponentId}
                    onSelectComponent={setSelectedComponentId}
                    onDeleteComponent={deleteComponent}
                    onReorderComponents={reorderComponents}
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

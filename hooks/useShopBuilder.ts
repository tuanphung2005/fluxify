import { useState, useEffect, useCallback } from "react";
import { ComponentType } from "@prisma/client";
import { ComponentConfig, ShopTemplateData, ShopComponentData } from "@/types/shop";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function useShopBuilder() {
    const router = useRouter();
    const [template, setTemplate] = useState<ShopTemplateData | null>(null);
    const [components, setComponents] = useState<ShopComponentData[]>([]);
    const [savedComponents, setSavedComponents] = useState<ShopComponentData[]>([]);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        loadTemplate();
    }, []);

    // warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const createNewTemplate = async () => {
        try {
            const response = await fetch("/api/shop/template", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "My Shop" }),
            });

            if (response.ok) {
                const data = await response.json();
                setTemplate(data);
                setComponents([]);
                setSavedComponents([]);
                setHasUnsavedChanges(false);
            }
        } catch (error) {
            console.error("Error creating template:", error);
        }
    };

    const loadTemplate = async () => {
        try {
            const response = await fetch("/api/shop/template");

            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setTemplate(data);
                    setComponents(data.components || []);
                    setSavedComponents(data.components || []);
                    setHasUnsavedChanges(false);
                } else {
                    await createNewTemplate();
                }
            } else {
                await createNewTemplate();
            }
        } catch (error) {
            console.error("Error loading template:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addComponent = async (type: ComponentType, defaultConfig: ComponentConfig) => {
        if (!template) return;

        const newOrder = components.length;
        const tempId = `temp_${Date.now()}`;

        const newComponent: ShopComponentData = {
            id: tempId,
            templateId: template.id,
            type,
            order: newOrder,
            config: defaultConfig,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setComponents([...components, newComponent]);
        setSelectedComponentId(tempId);
        setHasUnsavedChanges(true);
    };

    const updateComponentConfig = (newConfig: ComponentConfig) => {
        if (!selectedComponentId) return;

        // update local
        setComponents(
            components.map((comp) =>
                comp.id === selectedComponentId
                    ? { ...comp, config: newConfig }
                    : comp
            )
        );

        // mark as unsaved
        setHasUnsavedChanges(true);
    };

    const deleteComponent = async (id: string) => {
        setComponents(components.filter((comp) => comp.id !== id));
        if (selectedComponentId === id) {
            setSelectedComponentId(null);
        }
        setHasUnsavedChanges(true);
    };

    const reorderComponents = async (reorderedComponents: ShopComponentData[]) => {
        const updatedOrder = reorderedComponents.map((comp, index) => ({
            ...comp,
            order: index
        }));

        setComponents(updatedOrder);
        setHasUnsavedChanges(true);
    };

    const saveChanges = async () => {
        if (!hasUnsavedChanges || !template) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/shop/components/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId: template.id,
                    components: components.map(c => ({
                        id: c.id,
                        type: c.type,
                        order: c.order,
                        config: c.config
                    }))
                }),
            });

            if (response.ok) {
                const updatedComponents = await response.json();
                setComponents(updatedComponents);
                setSavedComponents(updatedComponents);
                setHasUnsavedChanges(false);

                // temporary map
                if (selectedComponentId?.startsWith("temp_")) {
                    setSelectedComponentId(null);
                }
                toast.success("changes saved successfully");
            } else {
                const errorData = await response.json();
                toast.error(`failed to save changes: ${errorData.error || "unknown error"}`);
            }
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("error saving changes");
        } finally {
            setIsSaving(false);
        }
    };

    const publishShop = async () => {
        if (!template) return;

        try {
            setIsSaving(true);
            // save
            if (hasUnsavedChanges) {
                await saveChanges();
            }

            // publish
            const response = await fetch("/api/shop/template", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: template.id,
                    isPublished: true,
                }),
            });

            if (response.ok) {
                const updatedTemplate = await response.json();
                setTemplate(updatedTemplate);
                toast.success("shop published successfully");
            } else {
                toast.error("failed to publish shop");
            }
        } catch (error) {
            console.error("Error publishing template:", error);
            toast.error("error publishing shop");
        } finally {
            setIsSaving(false);
        }
    };

    const previewShop = () => {
        if (template) {
            window.open(`/shop/${template.vendorId}`, "_blank");
        }
    };

    return {
        template,
        components,
        selectedComponentId,
        isLoading,
        isSaving,
        hasUnsavedChanges,
        setSelectedComponentId,
        addComponent,
        updateComponentConfig,
        deleteComponent,
        reorderComponents,
        saveChanges,
        publishShop,
        previewShop,
    };
}

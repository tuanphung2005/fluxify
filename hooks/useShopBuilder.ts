import { useState, useEffect } from "react";
import { ComponentType } from "@prisma/client";
import { useRouter } from "next/navigation";

import {
  ComponentConfig,
  ShopTemplateData,
  ShopComponentData,
} from "@/types/shop";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api/api";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

interface VendorProfile {
  id: string;
  storeName: string;
  description: string | null;
  favicon: string | null;
}

export function useShopBuilder() {
  const router = useRouter();
  const [template, setTemplate] = useState<ShopTemplateData | null>(null);
  const [components, setComponents] = useState<ShopComponentData[]>([]);
  const [savedComponents, setSavedComponents] = useState<ShopComponentData[]>(
    [],
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOperating, setIsOperating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  useEffect(() => {
    loadTemplate();
    loadProducts();
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

  const loadProducts = async () => {
    try {
      const data = await api.get<Product[]>("/api/products");

      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const createNewTemplate = async () => {
    try {
      const response = await api.post<ShopTemplateData>("/api/shop/template", {
        name: "Cửa hàng của tôi",
      });

      if (response) {
        setTemplate(response);
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
      const data = await api.get<ShopTemplateData>("/api/shop/template");

      if (data) {
        setTemplate(data);
        setComponents(data.components || []);
        setSavedComponents(data.components || []);
        setHasUnsavedChanges(false);
      } else {
        await createNewTemplate();
      }
    } catch (err: any) {
      // Check for email verification error (403)
      if (err?.status === 403) {
        setNeedsEmailVerification(true);
        setError(err?.message || "Email verification required");
      } else {
        console.error("Error loading template:", err);
        setError("Failed to load shop template");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("Template isPublished:", template?.isPublished);

  const addComponent = async (
    type: ComponentType,
    defaultConfig: ComponentConfig,
  ) => {
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
        comp.id === selectedComponentId ? { ...comp, config: newConfig } : comp,
      ),
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

  const reorderComponents = async (
    reorderedComponents: ShopComponentData[],
  ) => {
    const updatedOrder = reorderedComponents.map((comp, index) => ({
      ...comp,
      order: index,
    }));

    setComponents(updatedOrder);
    setHasUnsavedChanges(true);
  };

  const performSave = async () => {
    const updatedComponents = await api.post<ShopComponentData[]>(
      "/api/shop/components/sync",
      {
        templateId: template!.id,
        components: components.map((c) => ({
          id: c.id,
          type: c.type,
          order: c.order,
          config: c.config,
        })),
      },
    );

    setComponents(updatedComponents);
    setSavedComponents(updatedComponents);
    setHasUnsavedChanges(false);

    if (selectedComponentId?.startsWith("temp_")) {
      setSelectedComponentId(null);
    }

    return updatedComponents;
  };

  const saveChanges = async () => {
    if (!hasUnsavedChanges || !template) return;

    setIsOperating(true);

    try {
      await toast.promise(performSave(), {
        loading: "Đang lưu thay đổi...",
        success: "Đã lưu thay đổi thành công",
        error: "Thất bại khi lưu thay đổi",
      });
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsOperating(false);
    }
  };

  const publishShop = async () => {
    if (!template) return;

    setIsOperating(true);

    const publishPromise = async () => {
      if (hasUnsavedChanges) {
        await performSave();
      }

      const updatedTemplate = await api.put<ShopTemplateData>(
        "/api/shop/template",
        {
          id: template.id,
          isPublished: true,
        },
      );

      setTemplate(updatedTemplate);

      return updatedTemplate;
    };

    try {
      await toast.promise(publishPromise(), {
        loading: "Đang xuất bản cửa hàng...",
        success: "Đã xuất bản cửa hàng thành công",
        error: "Thất bại khi xuất bản cửa hàng",
      });
    } catch (error) {
      console.error("Error publishing template:", error);
    } finally {
      setIsOperating(false);
    }
  };

  const unpublishShop = async () => {
    if (!template) return;

    setIsOperating(true);

    const unpublishPromise = async () => {
      const updatedTemplate = await api.put<ShopTemplateData>(
        "/api/shop/template",
        {
          id: template.id,
          isPublished: false,
        },
      );

      setTemplate(updatedTemplate);

      return updatedTemplate;
    };

    try {
      await toast.promise(unpublishPromise(), {
        loading: "Đang ẩn cửa hàng...",
        success: "Đã ẩn cửa hàng thành công",
        error: "Thất bại khi ẩn cửa hàng",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsOperating(false);
    }
  };

  const previewShop = () => {
    if (template) {
      window.open(`/shop/${template.vendorId}`, "_blank");
    }
  };

  const refetchProducts = () => {
    loadProducts();
  };

  return {
    template,
    components,
    selectedComponentId,
    isLoading,
    isOperating,
    hasUnsavedChanges,
    products,
    vendorProfile,
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
  };
}

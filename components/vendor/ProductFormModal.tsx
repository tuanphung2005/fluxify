"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button, Input, Textarea } from "@heroui/react";
import { useState, useEffect } from "react";

import VariantBuilder from "./VariantBuilder";
import ImageBuilder from "./ImageBuilder";

import { api } from "@/lib/api/api";
import { z } from "zod";
import { useFormValidation } from "@/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Giá phải là số dương",
  }),
  stock: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Tồn kho phải là số nguyên không âm",
  }),
  images: z.string(),
  variants: z.string().refine((val) => {
    if (!val.trim()) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "JSON tùy chọn không hợp lệ"),
  variantStock: z.string().refine((val) => {
    if (!val.trim()) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "JSON tồn kho không hợp lệ"),
});

export interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  images: string[];
  description?: string;
  variants?: any;
  variantStock?: any;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaved: () => void;
  product: Product | null;
}

const DEFAULT_PRODUCT_VALUES = {
  name: "",
  description: "",
  price: "",
  stock: "",
  images: "",
  variants: "",
  variantStock: "",
};

export default function ProductFormModal({
  isOpen,
  onOpenChange,
  onSaved,
  product,
}: ProductFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const {
    values,
    setValues,
    errors,
    handleChange,
    validate,
    resetForm,
  } = useFormValidation({
    schema: productSchema,
    initialValues: DEFAULT_PRODUCT_VALUES,
    onSubmit: async (formValues) => {
      // Logic handled in handleSubmit below because we need async state (isLoading) 
      // and specific error handling that might technically be outside the hook's scope 
      // if we want to keep it simple. But here I will call processSubmit.
    },
  });

  // Effect to populate form when product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setValues({
          name: product.name,
          description: product.description || "",
          price: String(product.price),
          stock: String(product.stock),
          images: product.images.join("\n"),
          variants: product.variants
            ? typeof product.variants === "string"
              ? product.variants
              : JSON.stringify(product.variants, null, 2)
            : "",
          variantStock: product.variantStock
            ? typeof product.variantStock === "string"
              ? product.variantStock
              : JSON.stringify(product.variantStock, null, 2)
            : "",
        });
      } else {
        resetForm();
      }
      setGeneralError("");
    }
  }, [isOpen, product, setValues, resetForm]);

  const processSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setGeneralError("");

    try {
      const imageUrls = values.images.split("\n").filter((url) => url.trim() !== "");
      let variantsData = null;
      let variantStockData = null;

      if (values.variants.trim()) {
        variantsData = JSON.parse(values.variants);
      }

      if (values.variantStock.trim()) {
        variantStockData = JSON.parse(values.variantStock);
      }

      const payload = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        images: imageUrls,
        variants: variantsData,
        variantStock: variantStockData,
      };

      if (product) {
        await api.put(`/api/products/${product.id}`, payload);
      } else {
        await api.post("/api/products", payload);
      }

      onSaved();
    } catch (err: any) {
      setGeneralError(err.message || "Không thể lưu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <ValidatedInput
                  isRequired
                  label="Tên sản phẩm"
                  value={values.name}
                  onValueChange={(v) => handleChange("name", v)}
                  error={errors.name}
                />

                <Textarea
                  label="Mô tả"
                  value={values.description}
                  onValueChange={(v) => handleChange("description", v)}
                />

                <div className="flex gap-4">
                  <ValidatedInput
                    isRequired
                    endContent="₫"
                    label="Giá (₫)"
                    type="number"
                    value={values.price}
                    onValueChange={(v) => handleChange("price", v)}
                    error={errors.price}
                  />
                  <ValidatedInput
                    isRequired
                    description="Tồn kho mặc định nếu không có tùy chọn"
                    label="Tồn kho (chung)"
                    type="number"
                    value={values.stock}
                    onValueChange={(v) => handleChange("stock", v)}
                    error={errors.stock}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-small font-medium">
                    Hình ảnh sản phẩm
                  </span>
                  <div className={errors.images ? "border-danger border rounded-md p-2" : ""}>
                    <ImageBuilder
                      value={values.images}
                      onChange={(v) => handleChange("images", v)}
                    />
                  </div>
                  {errors.images && <p className="text-tiny text-danger">{errors.images}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-small font-medium">
                    Tùy chọn sản phẩm
                  </span>
                  <div className={errors.variants || errors.variantStock ? "border-danger border rounded-md p-2" : ""}>
                    <VariantBuilder
                      key={product?.id || "new"}
                      stockValue={values.variantStock}
                      value={values.variants}
                      onChange={(v) => handleChange("variants", v)}
                      onStockChange={(v) => handleChange("variantStock", v)}
                    />
                  </div>
                  {(errors.variants || errors.variantStock) && (
                    <p className="text-tiny text-danger">{errors.variants || errors.variantStock}</p>
                  )}
                </div>

                {generalError && <p className="text-danger text-sm">{generalError}</p>}
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
                onPress={processSubmit}
              >
                {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Button, Input, Textarea } from "@heroui/react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import VariantBuilder from "./VariantBuilder";
import ImageBuilder from "./ImageBuilder";

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

export default function ProductFormModal({
    isOpen,
    onOpenChange,
    onSaved,
    product,
}: ProductFormModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [images, setImages] = useState("");
    const [variants, setVariants] = useState("");
    const [variantStock, setVariantStock] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setName(product.name);
                setDescription(product.description || "");
                setPrice(String(product.price));
                setStock(String(product.stock));
                setImages(product.images.join("\n"));
                // Handle variants whether it's already a string or an object
                if (product.variants) {
                    const variantsString = typeof product.variants === 'string'
                        ? product.variants
                        : JSON.stringify(product.variants, null, 2);
                    setVariants(variantsString);
                } else {
                    setVariants("");
                }
                // Handle variant stock
                if (product.variantStock) {
                    const stockString = typeof product.variantStock === 'string'
                        ? product.variantStock
                        : JSON.stringify(product.variantStock, null, 2);
                    setVariantStock(stockString);
                } else {
                    setVariantStock("");
                }
            } else {
                setName("");
                setDescription("");
                setPrice("");
                setStock("");
                setImages("");
                setVariants("");
                setVariantStock("");
            }
            setError("");
        }
    }, [isOpen, product]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");

        try {
            const imageUrls = images.split("\n").filter((url) => url.trim() !== "");
            let variantsData = null;
            let variantStockData = null;
            
            if (variants.trim()) {
                try {
                    variantsData = JSON.parse(variants);
                } catch {
                    throw new Error("Dữ liệu tùy chọn không hợp lệ");
                }
            }
            
            if (variantStock.trim()) {
                try {
                    variantStockData = JSON.parse(variantStock);
                } catch {
                    throw new Error("Dữ liệu tồn kho không hợp lệ");
                }
            }

            const payload = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                images: imageUrls,
                variants: variantsData,
                variantStock: variantStockData,
            };

            if (product) {
                await api.put(`/api/products/${product.id}`, payload);
            } else {
                await api.post("/api/products", payload);
            }

            // Reset form
            setName("");
            setDescription("");
            setPrice("");
            setStock("");
            setImages("");
            setVariants("");
            setVariantStock("");
            onSaved();
        } catch (err: any) {
            setError(err.message || "Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside" >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Tên sản phẩm"
                                    value={name}
                                    onValueChange={setName}
                                    isRequired

                                />
                                <Textarea
                                    label="Mô tả"
                                    value={description}
                                    onValueChange={setDescription}

                                />
                                <div className="flex gap-4">
                                    <Input
                                        label="Giá (₫)"
                                        type="number"
                                        value={price}
                                        onValueChange={setPrice}
                                        endContent="₫"
                                        isRequired

                                    />
                                    <Input
                                        label="Tồn kho (chung)"
                                        type="number"
                                        value={stock}
                                        onValueChange={setStock}
                                        isRequired
                                        description="Tồn kho mặc định nếu không có tùy chọn"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-small font-medium">Hình ảnh sản phẩm</span>
                                    <ImageBuilder
                                        value={images}
                                        onChange={setImages}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-small font-medium">Tùy chọn sản phẩm</span>
                                    <VariantBuilder
                                        key={product?.id || 'new'}
                                        value={variants}
                                        stockValue={variantStock}
                                        onChange={setVariants}
                                        onStockChange={setVariantStock}
                                    />
                                </div>
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
                                Hủy
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isLoading}
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

"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Button, Input, Textarea } from "@heroui/react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import VariantBuilder from "./VariantBuilder";

export interface Product {
    id: string;
    name: string;
    price: number | string;
    stock: number;
    images: string[];
    description?: string;
    variants?: any;
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
            } else {
                setName("");
                setDescription("");
                setPrice("");
                setStock("");
                setImages("");
                setVariants("");
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
            if (variants.trim()) {
                try {
                    variantsData = JSON.parse(variants);
                } catch {
                    throw new Error("Invalid JSON for variants");
                }
            }

            const payload = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                images: imageUrls,
                variants: variantsData,
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
            onSaved();
        } catch (err: any) {
            setError(err.message || "Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside" radius="none">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{product ? "Edit Product" : "Add Product"}</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Product Name"
                                    value={name}
                                    onValueChange={setName}
                                    isRequired
                                    radius="none"
                                />
                                <Textarea
                                    label="Description"
                                    value={description}
                                    onValueChange={setDescription}
                                    radius="none"
                                />
                                <div className="flex gap-4">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={price}
                                        onValueChange={setPrice}
                                        startContent="$"
                                        isRequired
                                        radius="none"
                                    />
                                    <Input
                                        label="Stock"
                                        type="number"
                                        value={stock}
                                        onValueChange={setStock}
                                        isRequired
                                        radius="none"
                                    />
                                </div>
                                <Textarea
                                    label="Image URLs (one per line)"
                                    value={images}
                                    onValueChange={setImages}
                                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                    radius="none"
                                />
                                <div className="flex flex-col gap-2">
                                    <span className="text-small font-medium">Variants</span>
                                    <VariantBuilder
                                        key={product?.id || 'new'}
                                        value={variants}
                                        onChange={setVariants}
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
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                            >
                                {product ? "Save Changes" : "Add Product"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

"use client";

import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { X } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string | null;
    stock: number;
    images: string[];
    variants: any;
}

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    // Parse variants if they exist
    let variants: { name: string; values: string[] }[] = [];
    try {
        if (product.variants) {
            const variantsData = typeof product.variants === 'string'
                ? JSON.parse(product.variants)
                : product.variants;

            if (typeof variantsData === 'object' && variantsData !== null) {
                variants = Object.entries(variantsData).map(([name, values]) => ({
                    name,
                    values: Array.isArray(values) ? (values as string[]) : [],
                }));
            }
        }
    } catch (e) {
        console.error("Error parsing variants", e);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            classNames={{
                body: "p-0",
                base: "bg-background",
                closeButton: "hidden",
            }}
        >
            <ModalContent>
                <ModalBody>
                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[600px]">
                        <Button
                            isIconOnly
                            variant="light"
                            className="absolute right-4 top-4 z-50"
                            onPress={onClose}
                        >
                            <X size={24} />
                        </Button>

                        {/* Product Image */}
                        <div className="relative bg-default-50 h-[400px] md:h-full">
                            {product.images[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    radius="none"
                                    removeWrapper
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-default-300">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-8 md:p-12 flex flex-col gap-6 h-full overflow-y-auto">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                                <p className="text-2xl md:text-3xl font-bold text-primary">
                                    ${Number(product.price).toFixed(2)}
                                </p>
                            </div>

                            {product.stock <= 0 ? (
                                <Chip color="default" variant="flat" size="lg">Out of Stock</Chip>
                            ) : product.stock < 5 ? (
                                <Chip color="warning" variant="flat" size="lg">Low Stock: {product.stock} left</Chip>
                            ) : (
                                <Chip color="success" variant="flat" size="lg">In Stock</Chip>
                            )}

                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-default-500 text-lg leading-relaxed">
                                    {product.description || "No description available."}
                                </p>
                            </div>

                            {variants.length > 0 && (
                                <div className="space-y-4 py-4 border-y border-divider">
                                    {variants.map((variant, index) => (
                                        <div key={index}>
                                            <h3 className="font-semibold mb-2">{variant.name}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {variant.values.map((value, vIndex) => (
                                                    <Chip
                                                        key={vIndex}
                                                        variant="flat"
                                                        className="cursor-pointer hover:bg-default-200"
                                                    >
                                                        {value}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-auto pt-6">
                                <AddToCartButton
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: Number(product.price),
                                        images: product.images,
                                    }}
                                    disabled={product.stock <= 0}
                                />
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

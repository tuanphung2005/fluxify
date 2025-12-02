"use client";

import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    };

    const hasMultipleImages = product.images.length > 1;

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

                        {/* Product Image Carousel */}
                        <div className="relative bg-default-50 w-full h-[600px] flex items-center justify-center">
                            {product.images[currentImageIndex] ? (
                                <Image
                                    src={product.images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    removeWrapper
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-default-300">
                                    No Image
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {hasMultipleImages && (
                                <>
                                    <Button
                                        isIconOnly
                                        variant="flat"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm z-10 shadow-lg"
                                        onPress={handlePrevImage}
                                        size="sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        variant="flat"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm z-10 shadow-lg"
                                        onPress={handleNextImage}
                                        size="sm"
                                    >
                                        <ChevronRight size={20} />
                                    </Button>
                                </>
                            )}

                            {/* Dot Indicators */}
                            {hasMultipleImages && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-background/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    {product.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`h-2 rounded-full transition-all ${index === currentImageIndex
                                                ? 'bg-primary w-6'
                                                : 'bg-default-400 hover:bg-default-500 w-2'
                                                }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        />
                                    ))}
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

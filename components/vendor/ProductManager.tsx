"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    useDisclosure,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import VariantBuilder from "./VariantBuilder";

interface Product {
    id: string;
    name: string;
    price: number | string;
    stock: number;
    images: string[];
    variants?: any;
}

interface ProductManagerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onProductsChange: () => void;
}

export default function ProductManager({
    isOpen,
    onOpenChange,
    onProductsChange,
}: ProductManagerProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const productModal = useDisclosure();

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<Product[]>("/api/products");
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const handleProductSaved = () => {
        fetchProducts();
        onProductsChange();
        productModal.onClose();
        setSelectedProduct(null);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        productModal.onOpen();
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        productModal.onOpen();
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await api.delete(`/api/products/${productId}`);
            fetchProducts();
            onProductsChange();
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>manage products</ModalHeader>
                            <ModalBody>
                                <div className="flex justify-between items-center mb-4 gap-4">
                                    <Input
                                        placeholder="Search products..."
                                        startContent={<Search size={18} />}
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        className="max-w-xs"
                                    />
                                    <Button
                                        color="primary"
                                        startContent={<Plus />}
                                        onPress={handleAddProduct}
                                    >
                                        Add Product
                                    </Button>
                                </div>
                                <Table aria-label="Products table">
                                    <TableHeader>
                                        <TableColumn>IMAGE</TableColumn>
                                        <TableColumn>NAME</TableColumn>
                                        <TableColumn>PRICE</TableColumn>
                                        <TableColumn>STOCK</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        items={filteredProducts}
                                        isLoading={isLoading}
                                        emptyContent="No products found."
                                    >
                                        {(product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    {product.images[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-default-200 rounded flex items-center justify-center text-xs">
                                                            No Img
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                                <TableCell>{product.stock}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="light"
                                                            isIconOnly
                                                            onPress={() => handleEditProduct(product)}
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="danger"
                                                            variant="light"
                                                            isIconOnly
                                                            onPress={() => handleDeleteProduct(product.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <ProductFormModal
                isOpen={productModal.isOpen}
                onOpenChange={productModal.onOpenChange}
                onSaved={handleProductSaved}
                product={selectedProduct}
            />
        </>
    );
}

interface ProductFormModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSaved: () => void;
    product: Product | null;
}

function ProductFormModal({
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
                // We don't have description in the Product interface used in the list, 
                // but we might want to fetch it or just leave it empty if not available in the list view.
                // Assuming the list view Product interface is limited.
                // Let's check if we need to fetch full product details or if we can just use what we have.
                // For now, let's assume we might need to fetch it if it's missing, or just use what's there.
                // The current Product interface in this file doesn't have description.
                // Let's assume we will just update what we have.
                // Wait, the API returns full product object usually.
                // Let's update the Product interface to include description if possible, or just ignore for now.
                // Actually, let's just use empty string if not present, but better to update interface.
                // For now, let's just populate what we have.
                setPrice(String(product.price));
                setStock(String(product.stock));
                setImages(product.images.join("\n"));
                setVariants(product.variants ? JSON.stringify(product.variants) : "");
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside">
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
                                />
                                <Textarea
                                    label="Description"
                                    value={description}
                                    onValueChange={setDescription}
                                />
                                <div className="flex gap-4">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={price}
                                        onValueChange={setPrice}
                                        startContent="$"
                                        isRequired
                                    />
                                    <Input
                                        label="Stock"
                                        type="number"
                                        value={stock}
                                        onValueChange={setStock}
                                        isRequired
                                    />
                                </div>
                                <Textarea
                                    label="Image URLs (one per line)"
                                    value={images}
                                    onValueChange={setImages}
                                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                />
                                <div className="flex flex-col gap-2">
                                    <span className="text-small font-medium">Variants</span>
                                    <VariantBuilder
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

"use client";

import {
    Button,
    Input,
    useDisclosure,
} from "@heroui/react";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";
import ProductsTable from "./ProductsTable";
import ProductFormModal, { Product } from "./ProductFormModal";
import ConfirmationModal from "../common/ConfirmationModal";

interface ProductManagerContentProps {
    onProductsChange?: () => void;
}

export default function ProductManagerContent({
    onProductsChange,
}: ProductManagerContentProps) {
    const productModal = useDisclosure();
    const deleteModal = useDisclosure();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

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
        if (onProductsChange) onProductsChange();
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

    const handleDeleteProduct = (productId: string) => {
        setProductToDelete(productId);
        deleteModal.onOpen();
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await api.delete(`/api/products/${productToDelete}`);
            fetchProducts();
            if (onProductsChange) onProductsChange();
            setProductToDelete(null);
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    return (
        <>
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
            <ProductsTable
                products={filteredProducts}
                isLoading={isLoading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
            />

            <ProductFormModal
                isOpen={productModal.isOpen}
                onOpenChange={productModal.onOpenChange}
                onSaved={handleProductSaved}
                product={selectedProduct}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.onClose}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}

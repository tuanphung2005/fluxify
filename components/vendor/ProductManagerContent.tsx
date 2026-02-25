"use client";

import { Button, Input, useDisclosure } from "@heroui/react";
import { Tabs, Tab } from "@heroui/tabs";
import { Pagination } from "@heroui/pagination";
import { Plus, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import ConfirmationModal from "../common/ConfirmationModal";

import ProductsTable from "./ProductsTable";
import ProductFormModal, { Product } from "./ProductFormModal";

import { api } from "@/lib/api/api";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductManagerContentProps {
  onProductsChange?: () => void;
}

interface ProductResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function ProductManagerContent({
  onProductsChange,
}: ProductManagerContentProps) {
  const productModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const restoreModal = useDisclosure();
  const [productToRestore, setProductToRestore] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
        ...(showDeleted ? { includeDeleted: "true" } : {}),
      });
      const data = await api.get<ProductResponse>(
        `/api/products?${queryParams}`,
      );

      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, showDeleted]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleRestoreProduct = (productId: string) => {
    setProductToRestore(productId);
    restoreModal.onOpen();
  };

  const confirmRestore = async () => {
    if (!productToRestore) return;

    try {
      await api.patch(`/api/products/${productToRestore}/restore`, {});
      fetchProducts();
      if (onProductsChange) onProductsChange();
      setProductToRestore(null);
    } catch (error) {
      console.error("Failed to restore product", error);
    }
  };

  const handleTabChange = (key: React.Key) => {
    setShowDeleted(key === "deleted");
    setPage(1);
  };

  // Filter products based on current tab
  const displayedProducts = showDeleted
    ? products.filter((p) => p.deletedAt)
    : products.filter((p) => !p.deletedAt);

  return (
    <>
      <Tabs
        className="mb-4"
        selectedKey={showDeleted ? "deleted" : "active"}
        onSelectionChange={handleTabChange}
      >
        <Tab key="active" title="Sản phẩm" />
        <Tab key="deleted" title="Đã xóa" />
      </Tabs>

      <div className="flex justify-between items-center mb-4 gap-4">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm sản phẩm..."
          startContent={<Search size={18} />}
          value={searchQuery}
          onValueChange={handleSearchChange}
        />
        {!showDeleted && (
          <Button
            color="primary"
            startContent={<Plus />}
            onPress={handleAddProduct}
          >
            Thêm sản phẩm
          </Button>
        )}
      </div>

      <ProductsTable
        isLoading={isLoading}
        products={displayedProducts}
        showDeleted={showDeleted}
        onDelete={handleDeleteProduct}
        onEdit={handleEditProduct}
        onRestore={handleRestoreProduct}
      />

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            showControls
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}

      <ProductFormModal
        isOpen={productModal.isOpen}
        product={selectedProduct}
        onOpenChange={productModal.onOpenChange}
        onSaved={handleProductSaved}
      />

      <ConfirmationModal
        cancelText="Hủy"
        confirmText="Xóa"
        isOpen={deleteModal.isOpen}
        message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
        title="Xóa sản phẩm"
        onClose={deleteModal.onClose}
        onConfirm={confirmDelete}
      />

      <ConfirmationModal
        cancelText="Hủy"
        confirmColor="success"
        confirmText="Khôi phục"
        isOpen={restoreModal.isOpen}
        message="Bạn có muốn khôi phục sản phẩm này không?"
        title="Khôi phục sản phẩm"
        onClose={restoreModal.onClose}
        onConfirm={confirmRestore}
      />
    </>
  );
}

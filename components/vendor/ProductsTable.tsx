"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Image as HeroUIImage } from "@heroui/image";
import { Button } from "@heroui/button";
import { Edit, Trash2 } from "lucide-react";

import { Product } from "./ProductFormModal";

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductsTable({
  products,
  isLoading,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <Table aria-label="Products table">
      <TableHeader>
        <TableColumn>HÌNH ẢNH</TableColumn>
        <TableColumn>TÊN SẢN PHẨM</TableColumn>
        <TableColumn>MÔ TẢ</TableColumn>
        <TableColumn>PHÂN LOẠI</TableColumn>
        <TableColumn>GIÁ</TableColumn>
        <TableColumn>TỒN KHO</TableColumn>
        <TableColumn>THAO TÁC</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="Không tìm thấy sản phẩm nào."
        isLoading={isLoading}
        items={products}
      >
        {(product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.images[0] ? (
                <HeroUIImage
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                  height={40}
                  src={product.images[0]}
                  width={40}
                />
              ) : (
                <div className="w-10 h-10 bg-default-200 rounded flex items-center justify-center text-xs">
                  No Img
                </div>
              )}
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>
              <span className="text-tiny text-default-500 line-clamp-2 max-w-[200px]">
                {product.description || "-"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {product.variants ? (
                  Object.keys(product.variants).map((key) => (
                    <span
                      key={key}
                      className="text-tiny bg-default-100 px-1 rounded"
                    >
                      {key}:{" "}
                      {Array.isArray(product.variants[key])
                        ? product.variants[key].length
                        : 0}
                    </span>
                  ))
                ) : (
                  <span className="text-tiny text-default-400">-</span>
                )}
              </div>
            </TableCell>
            <TableCell>${Number(product.price).toFixed(2)}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  color="primary"
                  size="sm"
                  variant="light"
                  onPress={() => onEdit(product)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => onDelete(product.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

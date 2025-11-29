"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
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
        <Table aria-label="Products table" >
            <TableHeader>
                <TableColumn>IMAGE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>VARIANTS</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STOCK</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
                items={products}
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
                        <TableCell>
                            <span className="text-tiny text-default-500 line-clamp-2 max-w-[200px]">
                                {product.description || "-"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {product.variants ? (
                                    Object.keys(product.variants).map((key) => (
                                        <span key={key} className="text-tiny bg-default-100 px-1 rounded">
                                            {key}: {Array.isArray(product.variants[key]) ? product.variants[key].length : 0}
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
                                    size="sm"
                                    color="primary"
                                    variant="light"
                                    isIconOnly
                                    onPress={() => onEdit(product)}
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    isIconOnly
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

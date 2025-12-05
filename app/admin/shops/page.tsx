"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Store, ExternalLink } from "lucide-react";
import { Button } from "@heroui/button";
import { api } from "@/lib/api/api";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";

interface ShopData {
    id: string;
    name: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    };
    _count: {
        products: number;
    };
}

export default function AdminShops() {
    const [shops, setShops] = useState<ShopData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const data = await api.get<ShopData[]>("/api/admin/shops");
                setShops(data);
            } catch (error) {
                console.error("Failed to fetch shops", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShops();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Shop Management</h1>
                <p className="text-default-500">View and manage vendor shops</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <Table aria-label="Shops table">
                    <TableHeader>
                        <TableColumn>SHOP NAME</TableColumn>
                        <TableColumn>OWNER</TableColumn>
                        <TableColumn>PRODUCTS</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>CREATED</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {shops.map((shop) => (
                            <TableRow key={shop.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                                            <Store size={16} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{shop.name}</p>
                                            <p className="text-xs text-default-500">/{shop.slug}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-sm">{shop.user.name || "Unknown"}</p>
                                        <p className="text-xs text-default-500">{shop.user.email}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{shop._count.products}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={shop.isPublished ? "success" : "warning"}
                                    >
                                        {shop.isPublished ? "Published" : "Draft"}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    {new Date(shop.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        as={Link}
                                        href={`/shop/${shop.slug}`}
                                        target="_blank"
                                    >
                                        <ExternalLink size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

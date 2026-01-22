"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Store, ExternalLink, Search } from "lucide-react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";

import { api } from "@/lib/api/api";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "@/lib/toast";

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

interface ShopsResponse {
  shops: ShopData[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function AdminShops() {
  const [shops, setShops] = useState<ShopData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
      });
      const data = await api.get<ShopsResponse>(
        `/api/admin/shops?${queryParams}`,
      );

      setShops(data.shops);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch shops", error);
      toast.error("Failed to fetch shops");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Shop Management</h1>
          <p className="text-default-500">View and manage vendor shops</p>
        </div>
        <Input
          className="max-w-xs"
          placeholder="Search shops..."
          startContent={<Search size={18} />}
          value={searchQuery}
          onValueChange={handleSearchChange}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table aria-label="Shops table">
            <TableHeader>
              <TableColumn>SHOP NAME</TableColumn>
              <TableColumn>OWNER</TableColumn>
              <TableColumn>PRODUCTS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No shops found." items={shops}>
              {(shop) => (
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
                      <p className="text-xs text-default-500">
                        {shop.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{shop._count.products}</TableCell>
                  <TableCell>
                    <Chip
                      color={shop.isPublished ? "success" : "warning"}
                      size="sm"
                      variant="flat"
                    >
                      {shop.isPublished ? "Published" : "Draft"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/shop/${shop.slug}`} target="_blank">
                      <Button isIconOnly size="sm" variant="light">
                        <ExternalLink size={16} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                showControls
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

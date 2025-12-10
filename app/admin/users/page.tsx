"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User as UserIcon, Search } from "lucide-react";
import { api } from "@/lib/api/api";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";
import { toast } from "@/lib/toast";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { useDebounce } from "@/hooks/use-debounce";

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    vendorProfile: {
        id: string;
    } | null;
}

interface UsersResponse {
    users: UserData[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const debouncedSearch = useDebounce(searchQuery, 300);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search: debouncedSearch
            });
            const data = await api.get<UsersResponse>(`/api/admin/users?${queryParams}`);
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        // Optimistic update using functional update to get latest state
        setUsers(prevUsers =>
            prevUsers.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u)
        );

        try {
            await api.patch(`/api/admin/users/${userId}/status`, { isActive: !currentStatus });
            toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
            // Revert on failure using functional update to get latest state
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, isActive: currentStatus } : u)
            );
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1); // Reset to first page on search
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-default-500">View and manage system users</p>
                </div>
                <Input
                    placeholder="Search users..."
                    startContent={<Search size={18} />}
                    value={searchQuery}
                    onValueChange={handleSearchChange}
                    className="max-w-xs"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <>
                    <Table aria-label="Users table">
                        <TableHeader>
                            <TableColumn>USER</TableColumn>
                            <TableColumn>ROLE</TableColumn>
                            <TableColumn>SHOPS</TableColumn>
                            <TableColumn>JOINED</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody items={users} emptyContent="No users found.">
                            {(user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                <UserIcon size={16} />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{user.name || "Unnamed User"}</p>
                                                <p className="text-xs text-default-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color={user.role === "ADMIN" ? "danger" : "default"}>
                                            {user.role}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{user.vendorProfile ? "Yes" : "No"}</TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={user.isActive ? "success" : "danger"} variant="dot">
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            size="sm"
                                            isSelected={user.isActive}
                                            onValueChange={() => toggleStatus(user.id, user.isActive)}
                                            isDisabled={user.role === "ADMIN"} // Prevent locking out admins
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                total={totalPages}
                                page={page}
                                onChange={setPage}
                                showControls
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

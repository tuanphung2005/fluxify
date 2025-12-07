"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User as UserIcon } from "lucide-react";
import { api } from "@/lib/api/api";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";
import { toast } from "@/lib/toast";

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

export default function AdminUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get<UserData[]>("/api/admin/users");
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));

        try {
            await api.patch(`/api/admin/users/${userId}/status`, { isActive: !currentStatus });
            toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
            // Revert on failure
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: currentStatus } : u));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-default-500">View and manage system users</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <Table aria-label="Users table">
                    <TableHeader>
                        <TableColumn>USER</TableColumn>
                        <TableColumn>ROLE</TableColumn>
                        <TableColumn>SHOPS</TableColumn>
                        <TableColumn>JOINED</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
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
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

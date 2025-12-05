"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User as UserIcon } from "lucide-react";
import { api } from "@/lib/api/api";
import { Spinner } from "@heroui/spinner";

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    vendorProfile: {
        id: string;
    } | null;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.get<UserData[]>("/api/admin/users");
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

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
                                    <Chip size="sm" color="success" variant="dot">Active</Chip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Spinner } from "@heroui/spinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated" && session?.user.role !== "ADMIN") {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading" || !session || session.user.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-default-50 flex">
            <AdminSidebar />
            <div className="flex-1 ml-64">
                <main className="p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

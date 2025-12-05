"use client";

import VendorSidebar from "./VendorSidebar";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-default-50 flex">
            <VendorSidebar />
            <div className="flex-1 ml-64">
                <main className="w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

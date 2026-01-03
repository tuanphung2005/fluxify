import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar/navbar";
import { PersonalDashboard } from "@/components/personal";

export default async function OrdersPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-default-50">
                <PersonalDashboard />
            </main>
        </div>
    );
}

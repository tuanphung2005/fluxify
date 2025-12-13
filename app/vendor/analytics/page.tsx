import AnalyticsDashboard from "@/components/vendor/AnalyticsDashboard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorAnalyticsPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== "VENDOR" && session.user.role !== "ADMIN")) {
        redirect("/auth/login");
    }

    return <AnalyticsDashboard />;
}

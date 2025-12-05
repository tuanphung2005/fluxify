import AdminStats from "@/components/admin/AdminStats";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                <p className="text-default-500">Welcome back, Admin</p>
            </div>

            <AdminStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-[400px]">
                    <CardHeader>
                        <h3 className="font-semibold">Recent Activity</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="flex items-center justify-center h-full text-default-400">
                            Chart placeholder
                        </div>
                    </CardBody>
                </Card>
                <Card className="h-[400px]">
                    <CardHeader>
                        <h3 className="font-semibold">System Health</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="flex items-center justify-center h-full text-default-400">
                            Chart placeholder
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

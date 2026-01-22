import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Navbar } from "@/components/navbar/navbar";

export default async function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow">
        <AdminLayout>{children}</AdminLayout>
      </main>
    </div>
  );
}

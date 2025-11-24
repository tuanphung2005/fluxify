import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "VENDOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-2xl font-bold">dashboard</h1>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
    </div>
  );
}

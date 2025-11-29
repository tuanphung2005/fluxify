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
      <div className="container mx-auto max-w-7xl px-6">{children}</div>
    </div>
  );
}

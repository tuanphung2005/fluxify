import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Navbar } from "@/components/navbar/navbar";

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
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}

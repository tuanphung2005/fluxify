import { Navbar } from "@/components/navbar/navbar";
import { LoginModal } from "@/components/common/LoginModal";
import { RegisterModal } from "@/components/common/RegisterModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container max-w-full flex-grow">{children}</main>
      <LoginModal />
      <RegisterModal />
    </div>
  );
}


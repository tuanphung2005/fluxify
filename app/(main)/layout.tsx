import { Navbar } from "@/components/navbar/navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container max-w-full pt-16 flex-grow">
                {children}
            </main>
        </div>
    );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ShopComponentWrapper from "@/components/shop/ShopComponentWrapper";
import CartDrawer from "@/components/shop/CartDrawer";
import CartButton from "@/components/shop/CartButton";
import FavoriteShopButton from "@/components/shop/FavoriteShopButton";
import ShopProductModalManager from "@/components/shop/ShopProductModalManager";

interface ShopPageProps {
    params: Promise<{
        vendorId: string;
    }>;
}

export default async function ShopPage(props: ShopPageProps) {
    const params = await props.params;
    const { vendorId } = params;

    // Fetch the vendor's published shop template
    const template = await prisma.shopTemplate.findFirst({
        where: {
            vendorId: vendorId,
            isPublished: true,
        },
        select: {
            id: true,
            publishedComponents: true,
            vendor: {
                include: {
                    products: true,
                },
            },
        },
    });

    if (!template) {
        notFound();
    }

    // Parse published components
    const components = (template.publishedComponents as any[]) || [];
    const products = template.vendor.products.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        description: p.description,
        stock: p.stock,
        images: p.images,
        variants: p.variants,
    }));

    return (
        <div className="min-h-screen">
            {components.map((component) => (
                <ShopComponentWrapper
                    key={component.id}
                    type={component.type}
                    config={component.config}
                    isBuilder={false}
                    products={products}
                    vendorId={vendorId}
                />
            ))}

            {components.length === 0 && (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-default-500 mb-2">
                            Shop Coming Soon
                        </h2>
                        <p className="text-default-400">
                            This shop is currently being set up. Check back later!
                        </p>
                    </div>
                </div>
            )}

            <ShopProductModalManager products={products} />

            {/* Floating Action Buttons - Favorite and Cart */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <FavoriteShopButton vendorId={vendorId} />
                <CartButton />
            </div>

            <CartDrawer />
        </div>
    );
}

// Generate metadata
export async function generateMetadata(props: ShopPageProps) {
    const params = await props.params;
    const { vendorId } = params;

    const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
    });

    return {
        title: vendor?.storeName || "Shop",
        description: vendor?.description || "Browse our products",
    };
}

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import ShopComponentWrapper from "@/components/shop/ShopComponentWrapper";
import CartDrawer from "@/components/shop/CartDrawer";
import CartButton from "@/components/shop/CartButton";
import ChatButton from "@/components/shop/ChatButton";
import FavoriteShopButton from "@/components/shop/FavoriteShopButton";
import ShopProductModalManager from "@/components/shop/ShopProductModalManager";
import VendorCartProvider from "@/components/shop/VendorCartProvider";
import ShopOverview from "@/components/shop/ShopOverview";
import ShopReviewsSection from "@/components/shop/ShopReviewsSection";

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
        select: {
          storeName: true,
          products: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  // parse component
  const components = (template.publishedComponents as any[]) || [];
  const vendorName = template.vendor.storeName;
  const products = template.vendor.products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    description: p.description,
    stock: p.stock,
    images: p.images,
    variants: p.variants,
    variantStock: p.variantStock,
  }));

  return (
    <VendorCartProvider vendorId={vendorId} vendorName={vendorName}>
      <div className="min-h-screen">
        {/* Shop Overview Stats */}
        <div className="container mx-auto px-4 pt-4">
          <ShopOverview vendorId={vendorId} />
        </div>

        {components.map((component) => (
          <ShopComponentWrapper
            key={component.id}
            config={component.config}
            isBuilder={false}
            products={products}
            type={component.type}
            vendorId={vendorId}
            vendorName={vendorName}
          />
        ))}

        {components.length === 0 && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-default-500 mb-2">
                Shop Coming Soon
              </h2>
              <p className="text-default-400">
                Shop đang được dựng, quay lại sau nhé!
              </p>
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="container mx-auto px-4 py-8">
          <ShopReviewsSection vendorId={vendorId} />
        </div>

        <ShopProductModalManager
          products={products}
          vendorId={vendorId}
          vendorName={vendorName}
        />

        {/* Chat, Favorite, Cart */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <ChatButton vendorId={vendorId} />
          <FavoriteShopButton vendorId={vendorId} />
          <CartButton />
        </div>

        <CartDrawer />
      </div>
    </VendorCartProvider>
  );
}

// create metadata
export async function generateMetadata(props: ShopPageProps) {
  const params = await props.params;
  const { vendorId } = params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
  });

  return {
    title: vendor?.storeName || "Cửa hàng",
    description: vendor?.description || "Duyệt một số sản phẩm",
  };
}

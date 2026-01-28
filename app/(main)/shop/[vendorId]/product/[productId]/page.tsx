import { notFound } from "next/navigation";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/shop/AddToCartButton";
import CartDrawer from "@/components/shop/CartDrawer";
import CartButton from "@/components/shop/CartButton";

interface ProductPageProps {
  params: Promise<{
    vendorId: string;
    productId: string;
  }>;
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const { vendorId, productId } = params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: {
        select: {
          storeName: true,
        },
      },
    },
  });

  if (!product || product.vendorId !== vendorId) {
    notFound();
  }

  const vendorName = product.vendor.storeName;

  // parse variants
  let variants: { name: string; values: string[] }[] = [];

  try {
    if (product.variants) {
      // string + object
      const variantsData =
        typeof product.variants === "string"
          ? JSON.parse(product.variants)
          : product.variants;

      if (typeof variantsData === "object" && variantsData !== null) {
        variants = Object.entries(variantsData).map(([name, values]) => ({
          name,
          values: Array.isArray(values) ? (values as string[]) : [],
        }));
      }
    }
  } catch (e) {
    console.error("Error parsing variants", e);
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          className="inline-flex items-center gap-2 text-default-500 hover:text-primary mb-8 transition-colors"
          href={`/shop/${vendorId}`}
        >
          <ArrowLeft size={20} />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto md:h-[600px] bg-default-50 rounded-2xl overflow-hidden">
            {product.images[0] ? (
              <Image
                alt={product.name}
                className="w-full h-full object-cover"
                height="100%"
                src={product.images[0]}
                width="100%"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-default-300">
                No Image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            {product.stock <= 0 ? (
              <Chip color="default" size="lg" variant="flat">
                Out of Stock
              </Chip>
            ) : product.stock < 5 ? (
              <Chip color="warning" size="lg" variant="flat">
                Low Stock: {product.stock} left
              </Chip>
            ) : (
              <Chip color="success" size="lg" variant="flat">
                In Stock
              </Chip>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-default-500 text-lg leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* if product variants > 0 */}
            {variants.length > 0 && (
              <div className="space-y-4 py-4 border-y border-divider">
                {variants.map((variant, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2">{variant.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((value, vIndex) => (
                        <Chip
                          key={vIndex}
                          className="cursor-pointer hover:bg-default-200"
                          variant="flat"
                        >
                          {value}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto pt-6">
              <AddToCartButton
                disabled={product.stock <= 0}
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  images: product.images,
                }}
                vendorId={vendorId}
                vendorName={vendorName}
              />
            </div>
          </div>
        </div>
      </div>
      <CartButton />
      <CartDrawer />
    </div>
  );
}

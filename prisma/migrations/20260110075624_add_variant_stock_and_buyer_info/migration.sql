/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,selectedVariant]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cart_items_cartId_productId_key";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "selectedVariant" TEXT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "selectedVariant" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "variantStock" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_selectedVariant_key" ON "cart_items"("cartId", "productId", "selectedVariant");

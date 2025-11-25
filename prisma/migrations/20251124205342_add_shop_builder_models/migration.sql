-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('HERO', 'PRODUCT_GRID', 'IMAGE_GALLERY', 'VIDEO_EMBED', 'TEXT_BLOCK', 'SPACER');

-- CreateTable
CREATE TABLE "shop_templates" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Shop',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_components" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "type" "ComponentType" NOT NULL,
    "order" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_templates_vendorId_key" ON "shop_templates"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_components_templateId_order_key" ON "shop_components"("templateId", "order");

-- AddForeignKey
ALTER TABLE "shop_templates" ADD CONSTRAINT "shop_templates_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_components" ADD CONSTRAINT "shop_components_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "shop_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

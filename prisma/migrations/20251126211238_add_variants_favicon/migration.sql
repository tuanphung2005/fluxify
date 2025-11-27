-- AlterTable
ALTER TABLE "products" ADD COLUMN     "variants" JSONB;

-- AlterTable
ALTER TABLE "shop_templates" ADD COLUMN     "publishedComponents" JSONB;

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "favicon" TEXT;

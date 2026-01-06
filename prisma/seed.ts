simport { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Create a fresh Prisma client for seeding
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...\n");

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@fluxify.com" },
        update: {},
        create: {
            email: "admin@fluxify.com",
            password: adminPassword,
            name: "Admin User",
            role: "ADMIN",
            emailVerified: new Date(),
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // 2. Create Demo Vendor
    const vendorPassword = await bcrypt.hash("Vendor123!", 12);
    const vendor = await prisma.user.upsert({
        where: { email: "vendor@fluxify.com" },
        update: {},
        create: {
            email: "vendor@fluxify.com",
            password: vendorPassword,
            name: "Demo Vendor",
            role: "VENDOR",
            emailVerified: new Date(),
        },
    });
    console.log("✅ Vendor user created:", vendor.email);

    // 3. Create Vendor Profile
    const vendorProfile = await prisma.vendorProfile.upsert({
        where: { userId: vendor.id },
        update: {},
        create: {
            userId: vendor.id,
            storeName: "Demo Store",
            description: "A demo store showcasing Fluxify features",
        },
    });
    console.log("✅ Vendor profile created:", vendorProfile.storeName);

    // 4. Create Categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: "electronics" },
            update: {},
            create: {
                name: "Electronics",
                slug: "electronics",
                description: "Electronic devices and gadgets",
            },
        }),
        prisma.category.upsert({
            where: { slug: "clothing" },
            update: {},
            create: {
                name: "Clothing",
                slug: "clothing",
                description: "Fashion and apparel",
            },
        }),
        prisma.category.upsert({
            where: { slug: "home-garden" },
            update: {},
            create: {
                name: "Home & Garden",
                slug: "home-garden",
                description: "Home decor and garden supplies",
            },
        }),
    ]);
    console.log("✅ Categories created:", categories.length);

    // 5. Create Sample Products
    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: "prod_demo_1" },
            update: {},
            create: {
                id: "prod_demo_1",
                name: "Wireless Headphones",
                description: "High-quality wireless headphones with noise cancellation",
                price: 149.99,
                stock: 50,
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
                tags: ["audio", "wireless", "headphones"],
                vendorId: vendorProfile.id,
                categoryId: categories[0].id,
            },
        }),
        prisma.product.upsert({
            where: { id: "prod_demo_2" },
            update: {},
            create: {
                id: "prod_demo_2",
                name: "Classic T-Shirt",
                description: "Comfortable cotton t-shirt in various colors",
                price: 29.99,
                stock: 100,
                images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
                tags: ["clothing", "casual", "cotton"],
                vendorId: vendorProfile.id,
                categoryId: categories[1].id,
            },
        }),
        prisma.product.upsert({
            where: { id: "prod_demo_3" },
            update: {},
            create: {
                id: "prod_demo_3",
                name: "Smart Watch",
                description: "Feature-rich smartwatch with health tracking",
                price: 299.99,
                stock: 25,
                images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
                tags: ["electronics", "wearable", "smart"],
                vendorId: vendorProfile.id,
                categoryId: categories[0].id,
            },
        }),
    ]);
    console.log("✅ Products created:", products.length);

    // 6. Create Demo Customer
    const customerPassword = await bcrypt.hash("Customer123!", 12);
    const customer = await prisma.user.upsert({
        where: { email: "customer@fluxify.com" },
        update: {},
        create: {
            email: "customer@fluxify.com",
            password: customerPassword,
            name: "Demo Customer",
            role: "CUSTOMER",
            emailVerified: new Date(),
        },
    });
    console.log("✅ Customer user created:", customer.email);

    // 7. Create Shop Template for Vendor
    await prisma.shopTemplate.upsert({
        where: { vendorId: vendorProfile.id },
        update: {},
        create: {
            vendorId: vendorProfile.id,
            name: "Demo Store",
            isPublished: true,
        },
    });
    console.log("✅ Shop template created");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Demo Accounts:");
    console.log("   Admin:    admin@fluxify.com / Admin123!");
    console.log("   Vendor:   vendor@fluxify.com / Vendor123!");
    console.log("   Customer: customer@fluxify.com / Customer123!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

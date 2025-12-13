import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ============================================
// Category Queries
// ============================================

export interface CategoryCreateInput {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
}

export interface CategoryUpdateInput {
    name?: string;
    slug?: string;
    description?: string | null;
    image?: string | null;
    parentId?: string | null;
}

export async function getAllCategories(options: {
    includeChildren?: boolean;
    includeProductCount?: boolean;
} = {}) {
    const { includeChildren = false, includeProductCount = false } = options;

    return prisma.category.findMany({
        where: { parentId: null }, // Only top-level categories
        include: {
            children: includeChildren ? {
                include: {
                    _count: includeProductCount ? { select: { products: true } } : undefined,
                },
            } : false,
            _count: includeProductCount ? { select: { products: true } } : undefined,
        },
        orderBy: { name: "asc" },
    });
}

export async function getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
        where: { slug },
        include: {
            parent: true,
            children: true,
            _count: { select: { products: true } },
        },
    });
}

export async function getCategoryById(id: string) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            parent: true,
            children: true,
            _count: { select: { products: true } },
        },
    });
}

export async function createCategory(data: CategoryCreateInput) {
    return prisma.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            image: data.image,
            parentId: data.parentId,
        },
        include: {
            parent: true,
        },
    });
}

export async function updateCategory(id: string, data: CategoryUpdateInput) {
    return prisma.category.update({
        where: { id },
        data,
        include: {
            parent: true,
            children: true,
        },
    });
}

export async function deleteCategory(id: string) {
    // First, update products to remove category reference
    await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
    });

    // Also update child categories to remove parent reference
    await prisma.category.updateMany({
        where: { parentId: id },
        data: { parentId: null },
    });

    return prisma.category.delete({
        where: { id },
    });
}

export async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.category.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

// ============================================
// Review Queries
// ============================================

export interface ReviewCreateInput {
    productId: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
}

export async function getProductReviews(productId: string, options: {
    page?: number;
    limit?: number;
} = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.review.count({ where: { productId } }),
    ]);

    return {
        data: reviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getReviewSummary(productId: string) {
    const reviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
    });

    if (reviews.length === 0) {
        return {
            avgRating: 0,
            totalReviews: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const review of reviews) {
        sum += review.rating;
        if (review.rating >= 1 && review.rating <= 5) {
            distribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
        }
    }

    return {
        avgRating: Number((sum / reviews.length).toFixed(1)),
        totalReviews: reviews.length,
        distribution,
    };
}

export async function createReview(data: ReviewCreateInput) {
    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
        where: {
            productId_userId: {
                productId: data.productId,
                userId: data.userId,
            },
        },
    });

    if (existing) {
        throw new Error("You have already reviewed this product");
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
        where: {
            productId: data.productId,
            order: {
                userId: data.userId,
                status: { in: ["DELIVERED", "SHIPPED"] },
            },
        },
    });

    const review = await prisma.review.create({
        data: {
            productId: data.productId,
            userId: data.userId,
            rating: data.rating,
            title: data.title,
            comment: data.comment,
            isVerified: !!hasPurchased,
        },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });

    // Update product's average rating
    await updateProductRating(data.productId);

    return review;
}

export async function updateProductRating(productId: string) {
    const summary = await getReviewSummary(productId);

    await prisma.product.update({
        where: { id: productId },
        data: {
            avgRating: summary.avgRating,
            reviewCount: summary.totalReviews,
        },
    });
}

// ============================================
// Wishlist Queries
// ============================================

export async function getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            vendor: true,
                        },
                    },
                },
                orderBy: { addedAt: "desc" },
            },
        },
    });

    if (!wishlist) {
        wishlist = await prisma.wishlist.create({
            data: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
            },
        });
    }

    return wishlist;
}

export async function addToWishlist(userId: string, productId: string) {
    const wishlist = await getOrCreateWishlist(userId);

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
            },
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            productId,
        },
        include: {
            product: true,
        },
    });
}

export async function removeFromWishlist(userId: string, productId: string) {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
    });

    if (!wishlist) {
        return null;
    }

    return prisma.wishlistItem.delete({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
            },
        },
    });
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
    });

    if (!wishlist) return false;

    const item = await prisma.wishlistItem.findUnique({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
            },
        },
    });

    return !!item;
}

// ============================================
// Coupon Queries
// ============================================

export interface CouponCreateInput {
    code: string;
    description?: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom?: Date;
    validUntil?: Date;
    vendorId: string;
}

export async function getVendorCoupons(vendorId: string) {
    return prisma.coupon.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
    });
}

export async function createCoupon(data: CouponCreateInput) {
    // Generate unique code if not provided
    const code = data.code.toUpperCase().replace(/\s/g, "");

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
        where: { code },
    });

    if (existing) {
        throw new Error("Coupon code already exists");
    }

    return prisma.coupon.create({
        data: {
            code,
            description: data.description,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minPurchase: data.minPurchase,
            maxDiscount: data.maxDiscount,
            usageLimit: data.usageLimit,
            validFrom: data.validFrom || new Date(),
            validUntil: data.validUntil,
            vendorId: data.vendorId,
        },
    });
}

export async function validateCoupon(code: string, cartTotal: number, vendorId?: string): Promise<{
    valid: boolean;
    coupon?: Prisma.CouponGetPayload<object>;
    discountAmount?: number;
    error?: string;
}> {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon) {
        return { valid: false, error: "Coupon not found" };
    }

    if (!coupon.isActive) {
        return { valid: false, error: "Coupon is not active" };
    }

    const now = new Date();
    if (now < coupon.validFrom) {
        return { valid: false, error: "Coupon is not yet valid" };
    }

    if (coupon.validUntil && now > coupon.validUntil) {
        return { valid: false, error: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, error: "Coupon usage limit reached" };
    }

    if (coupon.minPurchase && cartTotal < Number(coupon.minPurchase)) {
        return { valid: false, error: `Minimum purchase of $${coupon.minPurchase} required` };
    }

    // Optionally check if coupon is for a specific vendor
    if (vendorId && coupon.vendorId !== vendorId) {
        return { valid: false, error: "Coupon is not valid for this store" };
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === "PERCENTAGE") {
        discountAmount = cartTotal * (Number(coupon.discountValue) / 100);
    } else {
        discountAmount = Number(coupon.discountValue);
    }

    // Apply max discount cap if set
    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
    }

    // Don't exceed cart total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    return {
        valid: true,
        coupon,
        discountAmount: Number(discountAmount.toFixed(2)),
    };
}

export async function useCoupon(couponId: string) {
    return prisma.coupon.update({
        where: { id: couponId },
        data: {
            usageCount: { increment: 1 },
        },
    });
}

export async function deleteCoupon(id: string, vendorId: string) {
    // Verify ownership
    const coupon = await prisma.coupon.findUnique({
        where: { id },
    });

    if (!coupon || coupon.vendorId !== vendorId) {
        throw new Error("Coupon not found");
    }

    return prisma.coupon.delete({
        where: { id },
    });
}

// ============================================
// Product View / Analytics Queries
// ============================================

export async function recordProductView(productId: string, userId?: string, sessionId?: string) {
    // Record the view
    await prisma.productView.create({
        data: {
            productId,
            userId,
            sessionId,
        },
    });

    // Increment view count on product
    await prisma.product.update({
        where: { id: productId },
        data: {
            viewCount: { increment: 1 },
        },
    });
}

export async function getProductViewStats(productId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await prisma.productView.groupBy({
        by: ["viewedAt"],
        where: {
            productId,
            viewedAt: { gte: startDate },
        },
        _count: true,
    });

    return views;
}

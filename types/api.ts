// API Response types - replacing all any[] usage

import { OrderStatus } from "@prisma/client";

// Define DiscountType to match Prisma enum
export type DiscountType = "PERCENTAGE" | "FIXED";

// ============================================
// User & Auth Types
// ============================================

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Product Types
// ============================================

export interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
  images: string[];
  variants: ProductVariant[] | null;
  tags: string[];
  vendorId: string;
  categoryId: string | null;
  viewCount: number;
  avgRating: number | null;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  vendor?: VendorData;
  category?: CategoryData;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  priceModifier?: number;
  stockModifier?: number;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent?: CategoryData;
  children?: CategoryData[];
  productCount?: number;
}

// ============================================
// Review Types
// ============================================

export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============================================
// Wishlist Types
// ============================================

export interface WishlistData {
  id: string;
  userId: string;
  items: WishlistItemData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItemData {
  id: string;
  wishlistId: string;
  productId: string;
  addedAt: Date;
  product?: ProductData;
}

// ============================================
// Coupon Types
// ============================================

export interface CouponData {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number | string;
  minPurchase: number | string | null;
  maxDiscount: number | string | null;
  usageLimit: number | null;
  usageCount: number;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: CouponData;
  discountAmount?: number;
  error?: string;
}

// ============================================
// Order Types
// ============================================

export interface OrderData {
  id: string;
  userId: string;
  total: number | string;
  status: OrderStatus;
  addressId: string;
  couponId: string | null;
  discountAmount: number | string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: UserData;
  address?: AddressData;
  coupon?: CouponData;
  items?: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number | string;
  product?: ProductData;
}

export interface AddressData {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// ============================================
// Vendor Types
// ============================================

export interface VendorData {
  id: string;
  userId: string;
  storeName: string;
  description: string | null;
  favicon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Analytics Types
// ============================================

export interface ProductViewData {
  id: string;
  productId: string;
  userId: string | null;
  sessionId: string | null;
  viewedAt: Date;
}

export interface VendorAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueByDate: ChartDataPoint[];
  ordersByDate: ChartDataPoint[];
  topProducts: TopProductData[];
  recentOrders: OrderData[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TopProductData {
  product: ProductData;
  totalSold: number;
  totalRevenue: number;
  viewCount: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardData {
  totalSales: number;
  pendingOrders: number;
  totalRevenue: number;
  chartData: ChartDataPoint[];
  recentActivity: RecentActivityItem[];
}

export interface RecentActivityItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  order: {
    id: string;
    createdAt: Date;
  };
  price: number | string;
  quantity: number;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================
// Filter Types
// ============================================

export interface ProductFilters extends PaginationParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  vendorId?: string;
}

// ============================================
// API Response Wrapper
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// Cart Types (extended)
// ============================================

export interface CartData {
  id: string;
  userId: string;
  items: CartItemData[];
  createdAt: Date;
  updatedAt: Date;
  subtotal?: number;
  discount?: number;
  total?: number;
}

export interface CartItemData {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: ProductData;
}

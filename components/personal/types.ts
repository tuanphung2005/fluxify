// Types shared across personal dashboard components

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface FavoriteShop {
  id: string;
  addedAt: string;
  vendor: {
    id: string;
    storeName: string;
    description: string | null;
    favicon: string | null;
    productCount: number;
  };
}

export interface PersonalData {
  user: {
    name: string | null;
    email: string;
    memberSince: string;
    emailVerified: string | null;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
  orders: Order[];
  favoriteShops: FavoriteShop[];
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const canCancelOrder = (status: string) => {
  return status === "PENDING" || status === "PROCESSING";
};

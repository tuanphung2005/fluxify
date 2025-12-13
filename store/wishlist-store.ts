import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api/api";
import type { WishlistItemData, ProductData } from "@/types/api";

interface WishlistState {
    items: WishlistItemData[];
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    fetchWishlist: () => Promise<void>;
    addItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            isInitialized: false,

            fetchWishlist: async () => {
                set({ isLoading: true });
                try {
                    const response = await api.get<{ items: WishlistItemData[] }>("/api/wishlist");
                    set({
                        items: response.items || [],
                        isInitialized: true,
                        isLoading: false
                    });
                } catch {
                    // User might not be logged in
                    set({ items: [], isInitialized: true, isLoading: false });
                }
            },

            addItem: async (productId: string) => {
                try {
                    const response = await api.post<WishlistItemData>("/api/wishlist", { productId });
                    const currentItems = get().items;

                    // Avoid duplicates
                    if (!currentItems.find(item => item.productId === productId)) {
                        set({ items: [...currentItems, response] });
                    }
                } catch (error) {
                    console.error("Failed to add to wishlist:", error);
                    throw error;
                }
            },

            removeItem: async (productId: string) => {
                try {
                    await api.delete(`/api/wishlist?productId=${productId}`);
                    set({
                        items: get().items.filter(item => item.productId !== productId)
                    });
                } catch (error) {
                    console.error("Failed to remove from wishlist:", error);
                    throw error;
                }
            },

            isInWishlist: (productId: string) => {
                return get().items.some(item => item.productId === productId);
            },

            clear: () => {
                set({ items: [], isInitialized: false });
            },
        }),
        {
            name: "wishlist-storage",
            partialize: (state) => ({ items: state.items }),
        }
    )
);

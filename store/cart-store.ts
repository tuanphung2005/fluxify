import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
}

interface CartState {
    // Map of vendorId -> cart items
    carts: Record<string, CartItem[]>;
    // Current active vendor context
    currentVendorId: string | null;
    currentVendorName: string | null;
    isOpen: boolean;

    // Set the active vendor context
    setCurrentVendor: (vendorId: string | null, vendorName?: string | null) => void;

    // Cart operations (operate on current vendor's cart)
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;

    // Getters
    getItems: () => CartItem[];
    total: () => number;

    // UI state
    setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            carts: {},
            currentVendorId: null,
            currentVendorName: null,
            isOpen: false,

            setCurrentVendor: (vendorId, vendorName = null) => {
                set({
                    currentVendorId: vendorId,
                    currentVendorName: vendorName
                });
            },

            addItem: (item) => {
                const { currentVendorId, carts } = get();
                if (!currentVendorId) return;

                const vendorCart = carts[currentVendorId] || [];
                const existingItem = vendorCart.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        carts: {
                            ...carts,
                            [currentVendorId]: vendorCart.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                            ),
                        },
                        isOpen: true,
                    });
                } else {
                    set({
                        carts: {
                            ...carts,
                            [currentVendorId]: [...vendorCart, { ...item, quantity: 1 }],
                        },
                        isOpen: true,
                    });
                }
            },

            removeItem: (id) => {
                const { currentVendorId, carts } = get();
                if (!currentVendorId) return;

                const vendorCart = carts[currentVendorId] || [];
                set({
                    carts: {
                        ...carts,
                        [currentVendorId]: vendorCart.filter((i) => i.id !== id),
                    },
                });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                const { currentVendorId, carts } = get();
                if (!currentVendorId) return;

                const vendorCart = carts[currentVendorId] || [];
                set({
                    carts: {
                        ...carts,
                        [currentVendorId]: vendorCart.map((i) =>
                            i.id === id ? { ...i, quantity } : i
                        ),
                    },
                });
            },

            clearCart: () => {
                const { currentVendorId, carts } = get();
                if (!currentVendorId) return;

                set({
                    carts: {
                        ...carts,
                        [currentVendorId]: [],
                    },
                });
            },

            getItems: () => {
                const { currentVendorId, carts } = get();
                if (!currentVendorId) return [];
                return carts[currentVendorId] || [];
            },

            total: () => {
                const items = get().getItems();
                return items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },

            setIsOpen: (isOpen) => set({ isOpen }),
        }),
        {
            name: 'fluxify-cart-v2',
        }
    )
);

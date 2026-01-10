import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    selectedVariant?: string; // Variant key like "Size:M,Color:Red"
    variantDisplay?: string; // Human-readable variant like "Size: M, Color: Red"
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
    removeItem: (id: string, selectedVariant?: string) => void;
    updateQuantity: (id: string, quantity: number, selectedVariant?: string) => void;
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
                
                // Find existing item with same ID AND variant
                const existingItem = vendorCart.find(
                    (i) => i.id === item.id && i.selectedVariant === item.selectedVariant
                );

                if (existingItem) {
                    // Increment quantity of existing item
                    set({
                        carts: {
                            ...carts,
                            [currentVendorId]: vendorCart.map((i) =>
                                i.id === item.id && i.selectedVariant === item.selectedVariant
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                            ),
                        },
                        isOpen: true,
                    });
                } else {
                    // Add new item
                    set({
                        carts: {
                            ...carts,
                            [currentVendorId]: [...vendorCart, { ...item, quantity: 1 }],
                        },
                        isOpen: true,
                    });
                }
            },

            removeItem: (id, selectedVariant) => {
                const { currentVendorId, carts } = get();
                if (!currentVendorId) return;

                const vendorCart = carts[currentVendorId] || [];
                set({
                    carts: {
                        ...carts,
                        [currentVendorId]: vendorCart.filter(
                            (i) => !(i.id === id && i.selectedVariant === selectedVariant)
                        ),
                    },
                });
            },

            updateQuantity: (id, quantity, selectedVariant) => {
                if (quantity <= 0) {
                    get().removeItem(id, selectedVariant);
                    return;
                }

                const { currentVendorId, carts } = get();
                if (!currentVendorId) return;

                const vendorCart = carts[currentVendorId] || [];
                set({
                    carts: {
                        ...carts,
                        [currentVendorId]: vendorCart.map((i) =>
                            i.id === id && i.selectedVariant === selectedVariant
                                ? { ...i, quantity }
                                : i
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
            name: 'fluxify-cart-v3', // Changed version to clear old cart data
        }
    )
);

import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/cart-store";

describe("Cart Store", () => {
    beforeEach(() => {
        // Reset the store before each test
        const store = useCartStore.getState();
        // Clear all carts
        useCartStore.setState({
            carts: {},
            currentVendorId: null,
            currentVendorName: null,
            isOpen: false
        });
    });

    describe("Vendor Context", () => {
        it("should set current vendor", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Test Shop");

            expect(useCartStore.getState().currentVendorId).toBe("vendor-1");
            expect(useCartStore.getState().currentVendorName).toBe("Test Shop");
        });

        it("should clear vendor context when set to null", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Test Shop");
            store.setCurrentVendor(null, null);

            expect(useCartStore.getState().currentVendorId).toBeNull();
            expect(useCartStore.getState().currentVendorName).toBeNull();
        });
    });

    describe("Add Item", () => {
        it("should not add item when no vendor is set", () => {
            const store = useCartStore.getState();
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
                image: "/test.jpg",
            });

            expect(store.getItems()).toHaveLength(0);
        });

        it("should add item to correct vendor cart", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
                image: "/test.jpg",
            });

            const items = useCartStore.getState().getItems();
            expect(items).toHaveLength(1);
            expect(items[0]).toMatchObject({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
                quantity: 1,
            });
        });

        it("should increment quantity for existing item", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
            });
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
            });

            const items = useCartStore.getState().getItems();
            expect(items).toHaveLength(1);
            expect(items[0].quantity).toBe(2);
        });

        it("should open cart drawer when item is added", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
            });

            expect(useCartStore.getState().isOpen).toBe(true);
        });
    });

    describe("Vendor-Specific Carts", () => {
        it("should maintain separate carts per vendor", () => {
            const store = useCartStore.getState();

            // Add item to vendor 1
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Product from Shop 1",
                price: 29.99,
            });

            // Add item to vendor 2
            store.setCurrentVendor("vendor-2", "Shop 2");
            store.addItem({
                id: "product-2",
                name: "Product from Shop 2",
                price: 49.99,
            });

            // Check vendor 2 cart
            expect(useCartStore.getState().getItems()).toHaveLength(1);
            expect(useCartStore.getState().getItems()[0].name).toBe("Product from Shop 2");

            // Switch back to vendor 1 and check its cart
            store.setCurrentVendor("vendor-1", "Shop 1");
            expect(useCartStore.getState().getItems()).toHaveLength(1);
            expect(useCartStore.getState().getItems()[0].name).toBe("Product from Shop 1");
        });

        it("should return empty array for vendor with no cart", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-new", "New Shop");

            expect(store.getItems()).toEqual([]);
        });
    });

    describe("Remove Item", () => {
        it("should remove item from cart", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
            });
            store.removeItem("product-1");

            expect(useCartStore.getState().getItems()).toHaveLength(0);
        });

        it("should only remove from current vendor cart", () => {
            const store = useCartStore.getState();

            // Add item to vendor 1
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Product 1",
                price: 29.99,
            });

            // Add item to vendor 2
            store.setCurrentVendor("vendor-2", "Shop 2");
            store.addItem({
                id: "product-2",
                name: "Product 2",
                price: 49.99,
            });

            // Remove from vendor 2
            store.removeItem("product-2");
            expect(useCartStore.getState().getItems()).toHaveLength(0);

            // Vendor 1 cart should still have item
            store.setCurrentVendor("vendor-1", "Shop 1");
            expect(useCartStore.getState().getItems()).toHaveLength(1);
        });
    });

    describe("Update Quantity", () => {
        it("should update item quantity", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
            });
            store.updateQuantity("product-1", 5);

            expect(useCartStore.getState().getItems()[0].quantity).toBe(5);
        });

        it("should remove item when quantity is 0 or less", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Test Product",
                price: 29.99,
            });
            store.updateQuantity("product-1", 0);

            expect(useCartStore.getState().getItems()).toHaveLength(0);
        });
    });

    describe("Clear Cart", () => {
        it("should clear current vendor cart only", () => {
            const store = useCartStore.getState();

            // Add items to both vendors
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({ id: "p1", name: "Prod 1", price: 10 });

            store.setCurrentVendor("vendor-2", "Shop 2");
            store.addItem({ id: "p2", name: "Prod 2", price: 20 });

            // Clear vendor 2 cart
            store.clearCart();
            expect(useCartStore.getState().getItems()).toHaveLength(0);

            // Vendor 1 cart should still have item
            store.setCurrentVendor("vendor-1", "Shop 1");
            expect(useCartStore.getState().getItems()).toHaveLength(1);
        });
    });

    describe("Total Calculation", () => {
        it("should calculate total for current vendor cart", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");
            store.addItem({
                id: "product-1",
                name: "Product 1",
                price: 29.99,
            });
            store.addItem({
                id: "product-2",
                name: "Product 2",
                price: 19.99,
            });
            store.updateQuantity("product-1", 2);

            // 29.99 * 2 + 19.99 = 79.97
            expect(useCartStore.getState().total()).toBeCloseTo(79.97, 2);
        });

        it("should return 0 for empty cart", () => {
            const store = useCartStore.getState();
            store.setCurrentVendor("vendor-1", "Shop 1");

            expect(store.total()).toBe(0);
        });

        it("should return 0 when no vendor is set", () => {
            const store = useCartStore.getState();
            expect(store.total()).toBe(0);
        });
    });

    describe("UI State", () => {
        it("should toggle cart drawer open state", () => {
            const store = useCartStore.getState();

            store.setIsOpen(true);
            expect(useCartStore.getState().isOpen).toBe(true);

            store.setIsOpen(false);
            expect(useCartStore.getState().isOpen).toBe(false);
        });
    });
});

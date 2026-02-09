import { describe, it, expect, beforeEach } from 'bun:test';

describe('Order Display with Buyer Information', () => {
    it('should display fullName when available', () => {
        const order = {
            id: 'test-order-1',
            fullName: 'Nguyễn Văn A',
            phoneNumber: '0987654321',
            user: {
                name: 'Old Name',
                email: 'test@example.com'
            }
        };

        // Test the display logic
        const displayName = order.fullName || order.user?.name || 'Khách';
        const displayContact = order.phoneNumber || order.user?.email || '';

        expect(displayName).toBe('Nguyễn Văn A');
        expect(displayContact).toBe('0987654321');
    });

    it('should fallback to user.name when fullName is not available', () => {
        const order = {
            id: 'test-order-2',
            fullName: null,
            phoneNumber: null,
            user: {
                name: 'User Name',
                email: 'user@example.com'
            }
        };

        const displayName = order.fullName || order.user?.name || 'Khách';
        const displayContact = order.phoneNumber || order.user?.email || '';

        expect(displayName).toBe('User Name');
        expect(displayContact).toBe('user@example.com');
    });

    it('should show "Khách" when no name is available', () => {
        const order = {
            id: 'test-order-3',
            fullName: null,
            phoneNumber: null,
            user: {
                name: null,
                email: 'guest@example.com'
            }
        };

        const displayName = order.fullName || order.user?.name || 'Khách';

        expect(displayName).toBe('Khách');
    });

    it('should format VND currency correctly', () => {
        const total = 123456;
        const formatted = Number(total).toLocaleString('vi-VN') + '₫';

        expect(formatted).toBe('123.456₫');
    });
});

describe('Variant Stock Display', () => {
    it('should calculate total stock across all variant combinations', () => {
        const variantStock = {
            'màu:xanh,Size:M': 10,
            'màu:xanh,Size:L': 15,
            'màu:đỏ,Size:M': 20,
            'màu:đỏ,Size:L': 5
        };

        // Calculate stock for "màu:xanh"
        let xanhStock = 0;
        Object.entries(variantStock).forEach(([key, stock]) => {
            const keyParts = key.split(',').map(part => {
                const [name, val] = part.split(':');
                return { name: name.trim(), value: val.trim() };
            });

            const hasMatch = keyParts.some(
                part => part.name === 'màu' && part.value === 'xanh'
            );

            if (hasMatch) {
                xanhStock += stock;
            }
        });

        expect(xanhStock).toBe(25); // 10 + 15
    });

    it('should calculate stock for "màu:đỏ"', () => {
        const variantStock = {
            'màu:xanh,Size:M': 10,
            'màu:xanh,Size:L': 15,
            'màu:đỏ,Size:M': 20,
            'màu:đỏ,Size:L': 5
        };

        let doStock = 0;
        Object.entries(variantStock).forEach(([key, stock]) => {
            const keyParts = key.split(',').map(part => {
                const [name, val] = part.split(':');
                return { name: name.trim(), value: val.trim() };
            });

            const hasMatch = keyParts.some(
                part => part.name === 'màu' && part.value === 'đỏ'
            );

            if (hasMatch) {
                doStock += stock;
            }
        });

        expect(doStock).toBe(25); // 20 + 5
    });
});

describe('VietQR Amount Calculation', () => {
    it('should not multiply VND amount by 1000', () => {
        const cartTotal = 50000; // 50,000 VND
        const qrAmount = Math.max(1000, Math.round(cartTotal));

        expect(qrAmount).toBe(50000);
        expect(qrAmount).toBeGreaterThanOrEqual(1000);
    });

    it('should enforce minimum 1000 VND', () => {
        const cartTotal = 500; // Less than minimum
        const qrAmount = Math.max(1000, Math.round(cartTotal));

        expect(qrAmount).toBe(1000);
    });

    it('should handle large amounts correctly', () => {
        const cartTotal = 5000000; // 5 million VND
        const qrAmount = Math.max(1000, Math.round(cartTotal));

        expect(qrAmount).toBe(5000000);
    });
});

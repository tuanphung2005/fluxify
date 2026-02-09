import { describe, it, expect } from 'bun:test';

describe('Variant Stock Management - Complete Flow', () => {
    describe('Variant Key Generation', () => {
        it('should generate consistent variant keys', () => {
            const selection1 = { 'màu': 'xanh', 'Size': 'M' };
            const selection2 = { 'Size': 'M', 'màu': 'xanh' };
            
            // Keys should be sorted alphabetically by name
            const key1 = Object.entries(selection1)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, value]) => `${name}:${value}`)
                .join(',');
            
            const key2 = Object.entries(selection2)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, value]) => `${name}:${value}`)
                .join(',');
            
            expect(key1).toBe(key2);
            expect(key1).toBe('màu:xanh,Size:M'); // Sorted: 'm' > 'S' in ASCII
        });
    });

    describe('Variant Stock Calculation', () => {
        it('should sum stock for all variants with same color', () => {
            const variantStock = {
                'Size:M,màu:xanh': 10,
                'Size:L,màu:xanh': 15,
                'Size:M,màu:đỏ': 20,
                'Size:L,màu:đỏ': 5
            };

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

        it('should handle Vietnamese characters in variant names', () => {
            const variantStock = {
                'Kích thước:Lớn,màu:đỏ': 30,
                'Kích thước:Nhỏ,màu:đỏ': 10
            };

            let totalStock = Object.values(variantStock).reduce((sum, stock) => sum + stock, 0);
            expect(totalStock).toBe(40);
        });
    });

    describe('Stock Availability Check', () => {
        it('should correctly identify out of stock variants', () => {
            const variantStock = {
                'Size:M,màu:xanh': 0,
                'Size:L,màu:xanh': 15,
                'Size:M,màu:đỏ': 5
            };

            const isOutOfStock = (variantKey: string) => {
                return (variantStock[variantKey] || 0) <= 0;
            };

            expect(isOutOfStock('Size:M,màu:xanh')).toBe(true);
            expect(isOutOfStock('Size:L,màu:xanh')).toBe(false);
            expect(isOutOfStock('Size:XL,màu:xanh')).toBe(true); // Not in stock
        });
    });
});

describe('Order Buyer Information', () => {
    describe('Display Logic', () => {
        it('should prioritize fullName over user.name', () => {
            const order = {
                fullName: 'Nguyễn Văn A',
                user: { name: 'Old Name', email: 'test@example.com' }
            };

            const displayName = order.fullName || order.user?.name || 'Khách';
            expect(displayName).toBe('Nguyễn Văn A');
        });

        it('should prioritize phoneNumber over user.email', () => {
            const order = {
                phoneNumber: '0987654321',
                user: { email: 'test@example.com' }
            };

            const displayContact = order.phoneNumber || order.user?.email || '';
            expect(displayContact).toBe('0987654321');
        });

        it('should handle null values gracefully', () => {
            const order = {
                fullName: null,
                phoneNumber: null,
                user: { name: null, email: 'guest@example.com' }
            };

            const displayName = order.fullName || order.user?.name || 'Khách';
            const displayContact = order.phoneNumber || order.user?.email || '';

            expect(displayName).toBe('Khách');
            expect(displayContact).toBe('guest@example.com');
        });
    });

    describe('Phone Number Validation', () => {
        it('should validate Vietnamese phone numbers', () => {
            const validPhones = ['0987654321', '0123456789', '0999999999'];
            const invalidPhones = ['123456789', '09876543210', 'abc1234567'];

            const phoneRegex = /^0\d{9}$/;

            validPhones.forEach(phone => {
                expect(phoneRegex.test(phone)).toBe(true);
            });

            invalidPhones.forEach(phone => {
                expect(phoneRegex.test(phone)).toBe(false);
            });
        });
    });
});

describe('Vietnamese Currency Formatting', () => {
    it('should format VND correctly', () => {
        const amounts = [
            { input: 1000, expected: '1.000₫' },
            { input: 50000, expected: '50.000₫' },
            { input: 123456, expected: '123.456₫' },
            { input: 1234567, expected: '1.234.567₫' }
        ];

        amounts.forEach(({ input, expected }) => {
            const formatted = input.toLocaleString('vi-VN') + '₫';
            expect(formatted).toBe(expected);
        });
    });

    it('should handle decimal values', () => {
        const amount = 29.99;
        const formatted = amount.toLocaleString('vi-VN') + '₫';
        expect(formatted).toBe('29,99₫');
    });
});

describe('VietQR Amount Handling', () => {
    it('should not multiply amount by 1000', () => {
        const cartTotal = 50000; // Already in VND
        const qrAmount = Math.max(1000, Math.round(cartTotal));
        
        expect(qrAmount).toBe(50000);
        expect(qrAmount).not.toBe(50000000); // Should NOT be multiplied
    });

    it('should enforce minimum 1000 VND', () => {
        const smallAmounts = [0, 100, 500, 999];
        
        smallAmounts.forEach(amount => {
            const qrAmount = Math.max(1000, Math.round(amount));
            expect(qrAmount).toBe(1000);
        });
    });

    it('should handle large amounts without overflow', () => {
        const largeAmount = 50000000; // 50 million VND
        const qrAmount = Math.max(1000, Math.round(largeAmount));
        
        expect(qrAmount).toBe(50000000);
        expect(qrAmount).toBeLessThan(2147483647); // Max int32
    });
});

describe('Variant Display in Orders', () => {
    it('should parse and format variant keys for display', () => {
        const variantKey = 'Size:M,màu:xanh';
        
        const formatted = variantKey.split(',').map(part => {
            const [name, value] = part.split(':');
            return `${name}: ${value}`;
        }).join(', ');
        
        expect(formatted).toBe('Size: M, màu: xanh');
    });

    it('should handle multiple variant attributes', () => {
        const variantKey = 'Kích thước:Lớn,Kiểu dáng:Slim,màu:đen';
        
        const formatted = variantKey.split(',').map(part => {
            const [name, value] = part.split(':');
            return `${name}: ${value}`;
        }).join(', ');
        
        expect(formatted).toBe('Kích thước: Lớn, Kiểu dáng: Slim, màu: đen');
    });
});

describe('Cart Item Variant Handling', () => {
    it('should treat same product with different variants as separate items', () => {
        const cart = [
            { id: 'product-1', selectedVariant: 'Size:M,màu:xanh', quantity: 2 },
            { id: 'product-1', selectedVariant: 'Size:L,màu:xanh', quantity: 1 }
        ];

        // Items should be distinct
        expect(cart.length).toBe(2);
        
        // Should be able to find specific variant
        const item = cart.find(i => 
            i.id === 'product-1' && i.selectedVariant === 'Size:M,màu:xanh'
        );
        expect(item?.quantity).toBe(2);
    });

    it('should generate unique keys for cart items with variants', () => {
        const generateKey = (id: string, variant?: string) => {
            return variant ? `${id}-${variant}` : id;
        };

        const key1 = generateKey('product-1', 'Size:M,màu:xanh');
        const key2 = generateKey('product-1', 'Size:L,màu:xanh');
        const key3 = generateKey('product-1');

        expect(key1).not.toBe(key2);
        expect(key1).not.toBe(key3);
        expect(key1).toBe('product-1-Size:M,màu:xanh');
    });
});

describe('Stock Deduction Logic', () => {
    it('should decrement variant stock, not general stock', () => {
        const product = {
            stock: 100,
            variantStock: {
                'Size:M,màu:xanh': 10,
                'Size:L,màu:xanh': 15
            }
        };

        const orderItem = {
            selectedVariant: 'Size:M,màu:xanh',
            quantity: 3
        };

        // Simulate stock deduction
        const newVariantStock = { ...product.variantStock };
        if (orderItem.selectedVariant) {
            newVariantStock[orderItem.selectedVariant] -= orderItem.quantity;
        }

        expect(newVariantStock['Size:M,màu:xanh']).toBe(7); // 10 - 3
        expect(newVariantStock['Size:L,màu:xanh']).toBe(15); // Unchanged
        expect(product.stock).toBe(100); // General stock unchanged
    });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    generateVietQRUrl,
    removeVietnameseDiacritics,
    hasPaymentConfigured,
    getBankByCode,
    fetchVietQRBanks,
} from "@/lib/vietqr";

const mockBanks = [
    { id: 17, name: 'Ngân hàng TMCP Công thương Việt Nam', code: 'ICB', bin: '970415', shortName: 'VietinBank', logo: '', transferSupported: 1, lookupSupported: 1, swift_code: '' },
    { id: 43, name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', code: 'VCB', bin: '970436', shortName: 'Vietcombank', logo: '', transferSupported: 1, lookupSupported: 1, swift_code: '' },
];

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("VietQR Utility", () => {
    beforeEach(() => {
        mockFetch.mockReset();
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ code: '00', desc: 'Success', data: mockBanks }),
        });
    });

    describe("generateVietQRUrl", () => {
        it("should generate valid VietQR URL", () => {
            const url = generateVietQRUrl({
                bankId: "VCB",
                accountNo: "1234567890",
                accountName: "NGUYEN VAN A",
                amount: 100000,
            });

            expect(url).toContain("https://img.vietqr.io/image/VCB-1234567890-compact2.png");
            expect(url).toContain("amount=100000");
            expect(url).toContain("accountName=NGUYEN+VAN+A");
        });

        it("should include description when provided", () => {
            const url = generateVietQRUrl({
                bankId: "TCB",
                accountNo: "9876543210",
                accountName: "TRAN THI B",
                amount: 50000,
                description: "ORDER123",
            });

            expect(url).toContain("addInfo=ORDER123");
        });

        it("should throw error for missing required fields", () => {
            expect(() =>
                generateVietQRUrl({
                    bankId: "",
                    accountNo: "123",
                    accountName: "Test",
                    amount: 1000,
                })
            ).toThrow("bankId, accountNo, and accountName are required");
        });

        it("should throw error for amount less than 1000", () => {
            expect(() =>
                generateVietQRUrl({
                    bankId: "VCB",
                    accountNo: "123",
                    accountName: "Test",
                    amount: 500,
                })
            ).toThrow("Amount must be at least 1000 VND");
        });
    });

    describe("removeVietnameseDiacritics", () => {
        it("should remove lowercase diacritics", () => {
            expect(removeVietnameseDiacritics("xin chào")).toBe("xin chao");
            expect(removeVietnameseDiacritics("việt nam")).toBe("viet nam");
        });

        it("should remove uppercase diacritics", () => {
            expect(removeVietnameseDiacritics("NGUYỄN VĂN AN")).toBe("NGUYEN VAN AN");
        });
    });

    describe("hasPaymentConfigured", () => {
        it("should return true when all fields are present", () => {
            expect(
                hasPaymentConfigured({
                    bankId: "VCB",
                    bankAccount: "123456",
                    bankAccountName: "TEST",
                })
            ).toBe(true);
        });

        it("should return false when bankId is missing", () => {
            expect(
                hasPaymentConfigured({
                    bankId: null,
                    bankAccount: "123456",
                    bankAccountName: "TEST",
                })
            ).toBe(false);
        });
    });

    describe("getBankByCode", () => {
        it("should return bank info for valid code", async () => {
            const bank = await getBankByCode("VCB");
            expect(bank).toBeDefined();
            expect(bank?.shortName).toBe("Vietcombank");
        });

        it("should return undefined for invalid code", async () => {
            const bank = await getBankByCode("INVALID");
            expect(bank).toBeUndefined();
        });
    });

    describe("fetchVietQRBanks", () => {
        it("should fetch and return banks", async () => {
            const banks = await fetchVietQRBanks();
            expect(banks).toHaveLength(2);
            expect(banks[0].code).toBe("ICB");
        });
    });
});

/**
 * VietQR Utility Library
 * 
 * VietQR is a Vietnamese bank transfer QR code standard.
 * This utility generates QR code URLs using the img.vietqr.io service.
 */

export interface VietQROptions {
    bankId: string;
    accountNo: string;
    accountName: string;
    amount: number;
    description?: string;
    template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}

export interface VietQRBank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
    swift_code: string | null;
}

interface VietQRBanksResponse {
    code: string;
    desc: string;
    data: VietQRBank[];
}

let cachedBanks: VietQRBank[] | null = null;

/**
 * Generate a VietQR image URL for bank transfer
 */
export function generateVietQRUrl(options: VietQROptions): string {
    const {
        bankId,
        accountNo,
        accountName,
        amount,
        description = '',
        template = 'compact2'
    } = options;

    if (!bankId || !accountNo || !accountName) {
        throw new Error('bankId, accountNo, and accountName are required');
    }

    if (amount < 1000) {
        throw new Error('Amount must be at least 1000 VND');
    }

    const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
    const params = new URLSearchParams();
    params.set('amount', amount.toString());

    if (description) {
        const cleanDescription = removeVietnameseDiacritics(description)
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .slice(0, 25)
            .trim();
        params.set('addInfo', cleanDescription);
    }

    const cleanAccountName = removeVietnameseDiacritics(accountName).toUpperCase();
    params.set('accountName', cleanAccountName);

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Remove Vietnamese diacritics from a string
 */
export function removeVietnameseDiacritics(str: string): string {
    const diacriticsMap: Record<string, string> = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D',
    };

    return str.split('').map(char => diacriticsMap[char] || char).join('');
}

/**
 * Fetch all banks from VietQR API
 * Results are cached in memory for performance
 */
export async function fetchVietQRBanks(): Promise<VietQRBank[]> {
    if (cachedBanks) {
        return cachedBanks;
    }

    try {
        const response = await fetch('https://api.vietqr.io/v2/banks', {
            next: { revalidate: 86400 } // Cache for 24 hours in Next.js
        });

        if (!response.ok) {
            throw new Error('Failed to fetch banks');
        }

        const data: VietQRBanksResponse = await response.json();

        // Filter to only banks that support transfers
        cachedBanks = data.data.filter(bank => bank.transferSupported === 1);

        return cachedBanks;
    } catch (error) {
        console.error('Failed to fetch VietQR banks:', error);
        return [];
    }
}

/**
 * Check if a vendor has payment configured
 */
export function hasPaymentConfigured(vendor: {
    bankId?: string | null;
    bankAccount?: string | null;
    bankAccountName?: string | null;
}): boolean {
    return !!(vendor.bankId && vendor.bankAccount && vendor.bankAccountName);
}

/**
 * Get bank info by code (e.g., 'VCB', 'TCB')
 */
export async function getBankByCode(code: string): Promise<VietQRBank | undefined> {
    const banks = await fetchVietQRBanks();
    return banks.find(bank => bank.code === code);
}

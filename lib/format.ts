/**
 * Utility functions for formatting Vietnamese currency and phone numbers
 */

/**
 * Format a number as Vietnamese Dong (VND)
 * Example: 123456 => "123.456₫"
 */
export function formatVND(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0₫';
  
  // Format with thousand separators using Vietnamese locale
  return num.toLocaleString('vi-VN') + '₫';
}

/**
 * Format Vietnamese phone number
 * Example: "0123456789" => "0123 456 789"
 */
export function formatVietnamesePhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX XXX XXX or XXXX XXX XXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Validate Vietnamese phone number
 * Should be 10 digits starting with 0
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^0\d{9}$/.test(cleaned);
}

/**
 * Parse VND string back to number
 * Example: "123.456₫" => 123456
 */
export function parseVND(vndString: string): number {
  const cleaned = vndString.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

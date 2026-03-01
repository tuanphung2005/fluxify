/**
 * Utility functions for formatting Vietnamese currency and phone numbers
 */

/**
 * Format a number as Vietnamese Dong (VND)
 * Example: 123456 => "123.456₫"
 */
export function formatVND(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return "0₫";

  // Format with thousand separators using Vietnamese locale
  return num.toLocaleString("vi-VN") + "₫";
}

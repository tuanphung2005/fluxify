/**
 * Utility functions for handling product variants
 */

export interface VariantOption {
  name: string;
  values: (string | ColorVariantValue)[];
}

export interface VariantSelection {
  [variantName: string]: string;
}

/**
 * Color variant value that stores both the display name and hex color
 */
export interface ColorVariantValue {
  name: string;
  color: string; // Hex color like "#FF0000"
}

/**
 * Check if a variant name indicates a color variant
 * Matches if name contains: màu, color, colours, colors, colour
 */
export function isColorVariant(name: string): boolean {
  const lowerName = name.toLowerCase().trim();
  const colorPatterns = ['màu', 'color', 'colours', 'colors', 'colour'];
  return colorPatterns.some(pattern => lowerName.includes(pattern));
}

/**
 * Parse a variant value to extract color info
 * Returns the ColorVariantValue if it's a color, or converts string to object
 */
export function parseColorValue(value: string | ColorVariantValue): ColorVariantValue | null {
  if (typeof value === 'object' && value !== null && 'name' in value && 'color' in value) {
    return value;
  }
  return null;
}

/**
 * Get display name from a variant value (works for both string and color values)
 */
export function getVariantDisplayName(value: string | ColorVariantValue): string {
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return value.name;
  }
  return value;
}

/**
 * Variant stock data type
 */
export type VariantStockData = Record<string, number>;

/**
 * Safely parse variant stock data from database JSON field
 * Handles all edge cases: null, undefined, string, object
 * @param variantStock - Raw variant stock from database (Prisma JSON field)
 * @returns Typed VariantStockData object
 */
export function parseVariantStockData(variantStock: unknown): VariantStockData {
  if (!variantStock) return {};

  // Handle string (shouldn't happen with Prisma, but just in case)
  if (typeof variantStock === 'string') {
    try {
      const parsed = JSON.parse(variantStock);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as VariantStockData;
      }
    } catch {
      return {};
    }
  }

  // Handle object
  if (typeof variantStock === 'object' && variantStock !== null) {
    return variantStock as VariantStockData;
  }

  return {};
}

/**
 * Get stock for a specific variant key
 * @param variantStock - Raw variant stock from database
 * @param variantKey - The variant key to look up
 * @returns Stock count for the variant, or 0 if not found
 */
export function getVariantStockForKey(variantStock: unknown, variantKey: string): number {
  const data = parseVariantStockData(variantStock);
  return data[variantKey] ?? 0;
}

/**
 * Generate a variant key from selections
 * Example: { Size: "M", Color: "Red" } => "Size:M,Color:Red"
 */
export function generateVariantKey(selections: VariantSelection): string {
  return Object.entries(selections)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}`)
    .join(',');
}

/**
 * Parse a variant key back to selections
 * Example: "Size:M,Color:Red" => { Size: "M", Color: "Red" }
 */
export function parseVariantKey(key: string): VariantSelection {
  if (!key) return {};

  const selections: VariantSelection = {};
  const parts = key.split(',');

  for (const part of parts) {
    const [name, value] = part.split(':');
    if (name && value) {
      selections[name] = value;
    }
  }

  return selections;
}

/**
 * Generate all possible variant combinations
 * Example: [{ name: "Size", values: ["S", "M"] }, { name: "Color", values: ["Red"] }]
 * => ["Size:S,Color:Red", "Size:M,Color:Red"]
 */
export function getAllVariantCombinations(variants: VariantOption[]): string[] {
  if (!variants || variants.length === 0) return [];

  const combinations: VariantSelection[] = [{}];

  for (const variant of variants) {
    const newCombinations: VariantSelection[] = [];

    for (const combination of combinations) {
      for (const value of variant.values) {
        newCombinations.push({
          ...combination,
          [variant.name]: getVariantDisplayName(value),
        });
      }
    }

    combinations.length = 0;
    combinations.push(...newCombinations);
  }

  return combinations.map(generateVariantKey);
}

/**
 * Get stock for a specific variant from product data
 */
export function getVariantStock(
  product: { stock: number; variantStock?: any; variants?: any },
  variantKey?: string
): number {
  // If no variant key provided or product has no variants, return overall stock
  if (!variantKey || !product.variants) {
    return product.stock;
  }

  // If product has variant stock data, use it
  if (product.variantStock && typeof product.variantStock === 'object') {
    const stock = product.variantStock[variantKey];
    return typeof stock === 'number' ? stock : 0;
  }

  // Fallback to overall stock
  return product.stock;
}

/**
 * Check if product has variants
 */
export function hasVariants(product: { variants?: any }): boolean {
  if (!product.variants) return false;

  try {
    const variants = typeof product.variants === 'string'
      ? JSON.parse(product.variants)
      : product.variants;

    if (typeof variants === 'object' && variants !== null) {
      return Object.keys(variants).length > 0;
    }
  } catch (e) {
    return false;
  }

  return false;
}

/**
 * Get total stock across all variants
 */
export function getTotalVariantStock(product: { variantStock?: any; stock: number }): number {
  if (!product.variantStock || typeof product.variantStock !== 'object') {
    return product.stock;
  }

  const stocks = Object.values(product.variantStock) as unknown[];
  return stocks.reduce<number>((sum, stock) => sum + (typeof stock === 'number' ? stock : 0), 0);
}

/**
 * Check if a specific variant is in stock
 */
export function isVariantInStock(
  product: { stock: number; variantStock?: any; variants?: any },
  variantKey?: string
): boolean {
  return getVariantStock(product, variantKey) > 0;
}

/**
 * Get stock status for a variant
 */
export function getVariantStockStatus(
  product: { stock: number; variantStock?: any; variants?: any },
  variantKey?: string
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  const stock = getVariantStock(product, variantKey);

  if (stock === 0) return 'out_of_stock';
  if (stock < 5) return 'low_stock';
  return 'in_stock';
}

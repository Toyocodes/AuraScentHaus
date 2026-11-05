/**
 * Shipping fee rules (kobo). Replace with your real pricing,
 * e.g. per-state rates, weight-based, or a courier API quote.
 */
const FLAT_FEE = 0; // e.g. 3000_00 for ₦3,000
const FREE_SHIPPING_FROM: number | null = null; // e.g. 100000_00 for free shipping over ₦100,000

export function calculateShippingFee(subtotal: number, _state: string): number {
  if (FREE_SHIPPING_FROM !== null && subtotal >= FREE_SHIPPING_FROM) return 0;
  return FLAT_FEE;
}

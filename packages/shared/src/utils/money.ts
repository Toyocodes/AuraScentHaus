/**
 * All money is stored and transported as integer **kobo** (₦1 = 100 kobo),
 * which is also what Paystack expects. Convert to naira only for display.
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNaira(kobo: number): string {
  return ngn.format(koboToNaira(kobo));
}

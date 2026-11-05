export { formatNaira } from "@aurascenthaus/shared";

const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" });
const dateTimeFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

/** "UNISEX" → "Unisex", "SUPER_ADMIN" → "Super admin" */
export function humanize(value: string): string {
  const s = value.replaceAll("_", " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const compactFmt = new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 });

/** Kobo → short naira for chart axes: ₦0, ₦50K, ₦1.2M */
export const formatNairaCompact = (kobo: number) => `₦${compactFmt.format(kobo / 100)}`;

/** "+12%" / "−8%" change vs a previous value, or null when there's nothing to compare. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

import { randomBytes } from "node:crypto";

// No 0/O/1/I to avoid confusion when customers read it out.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Human-friendly order number, e.g. ASH-261105-7KQ2M */
export function generateOrderNumber(date = new Date()): string {
  const yy = String(date.getUTCFullYear()).slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const bytes = randomBytes(5);
  const suffix = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `ASH-${yy}${mm}${dd}-${suffix}`;
}

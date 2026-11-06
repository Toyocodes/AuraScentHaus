export const SIZE_UNITS = ["ML", "G", "PIECE"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export const SIZE_UNIT_LABELS: Record<SizeUnit, string> = {
  ML: "Millilitres (ml)",
  G: "Grams (g)",
  PIECE: "Pieces",
};

/**
 * How a size reads to a person: "50 ml", "200 g", "Single item", "Set of 3".
 * `size` is the amount stored in the `sizeMl` field (the name is kept for compatibility).
 */
export function formatSize(size: number, unit: SizeUnit = "ML"): string {
  if (unit === "G") return `${size} g`;
  if (unit === "PIECE") return size === 1 ? "Single item" : `Set of ${size}`;
  return `${size} ml`;
}

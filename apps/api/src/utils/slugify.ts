import { randomHex } from "./crypto.js";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Returns `base` if free, otherwise `base-<random>`.
 * `exists` checks whether a slug is already taken.
 */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const slug = slugify(base) || randomHex(3);
  if (!(await exists(slug))) return slug;
  for (let i = 0; i < 5; i++) {
    const candidate = `${slug}-${randomHex(2)}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${slug}-${randomHex(4)}`;
}

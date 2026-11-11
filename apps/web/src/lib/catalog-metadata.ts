import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import type { CategoryDetailDTO, CategoryTreeDTO, DeliveryZoneDTO, ProductDetailDTO } from "@aurascenthaus/shared";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/**
 * The web app's server-side API calls: page titles and descriptions for search engines and link
 * previews, and the menu's categories (getCategoryTree). Page content still loads through the hooks.
 * If the API is down this returns null and the page falls back to a default, so it can never stop
 * a page from rendering.
 */
async function fetchData<T>(path: string): Promise<T | null> {
  "use cache";
  cacheLife("minutes");

  try {
    const response = await fetch(`${API_URL}/api${path}`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return null;
    const body = (await response.json()) as { data: T };
    return body.data;
  } catch {
    return null;
  }
}

/**
 * The menu's categories, so the page arrives with the whole navbar instead of adding the category
 * items a moment later. Null if the API can't be reached; the browser then loads them as before.
 */
export const getCategoryTree = () => fetchData<CategoryTreeDTO[]>("/categories?tree=true");

/** The delivery options and fees on offer, for the shipping policy page. Null if the API can't be reached. */
export const getDeliveryZones = () => fetchData<DeliveryZoneDTO[]>("/delivery-zones");

/** "scented-candles" → "Scented Candles", for when the API can't be reached. */
const titleFromSlug = (slug: string) => slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const summarise = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

export async function categoryMetadata(slug: string): Promise<Metadata> {
  const category = await fetchData<CategoryDetailDTO>(`/categories/${encodeURIComponent(slug)}`);
  const title = category?.name ?? titleFromSlug(slug);
  const description = summarise(category?.description || `Shop ${title} from AuraScentHaus, delivered across Nigeria.`);

  return {
    title,
    description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: { title, description, images: category?.imageUrl ? [category.imageUrl] : undefined },
  };
}

export async function productMetadata(slug: string): Promise<Metadata> {
  const product = await fetchData<ProductDetailDTO>(`/products/${encodeURIComponent(slug)}`);
  const title = product?.name ?? titleFromSlug(slug);
  const description = summarise(product?.description || `${title} from AuraScentHaus, delivered across Nigeria.`);

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: { title, description, images: product?.images[0] ? [product.images[0].url] : undefined },
  };
}

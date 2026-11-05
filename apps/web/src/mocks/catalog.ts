/**
 * TEMPORARY sample data so the UI can be designed before the API is connected.
 * The first four perfumes match apps/api/prisma/seed.ts.
 * Delete the whole src/mocks folder once pages use the hooks (search for "@/mocks").
 */
import type { CategoryDTO, Gender, ProductDetailDTO, ProductListItemDTO, VariantDTO } from "@aurascenthaus/shared";

const naira = (n: number) => n * 100; // → kobo

export const mockCategories: (CategoryDTO & { productCount: number })[] = [
  { id: "cat_floral", name: "Floral", slug: "floral", description: "Rose, jasmine, peony and bouquet blends.", imageUrl: null, productCount: 2 },
  { id: "cat_woody", name: "Woody", slug: "woody", description: "Sandalwood, cedar and vetiver.", imageUrl: null, productCount: 3 },
  { id: "cat_oud", name: "Oud", slug: "oud", description: "Rich, smoky agarwood scents.", imageUrl: null, productCount: 2 },
  { id: "cat_fresh", name: "Fresh", slug: "fresh", description: "Citrus, aquatic and green notes.", imageUrl: null, productCount: 1 },
];

interface Seed {
  name: string;
  slug: string;
  gender: Gender;
  category: string;
  description: string;
  notes: [string[], string[], string[]];
  featured?: boolean;
  variants: [sizeMl: number, price: number, stock: number, compareAt?: number][];
}

const seeds: Seed[] = [
  {
    name: "Velvet Rose Noir",
    slug: "velvet-rose-noir",
    gender: "WOMEN",
    category: "floral",
    description: "A dark, velvety rose wrapped in warm amber and a whisper of oud.",
    notes: [["Pink Pepper", "Bergamot"], ["Turkish Rose", "Jasmine"], ["Amber", "Oud", "Musk"]],
    featured: true,
    variants: [[50, 45_000, 25], [100, 78_000, 12]],
  },
  {
    name: "Cedar Smoke",
    slug: "cedar-smoke",
    gender: "MEN",
    category: "woody",
    description: "Smoked cedar, leather and vetiver. Bold and long-lasting.",
    notes: [["Cardamom", "Black Pepper"], ["Cedarwood", "Leather"], ["Vetiver", "Tonka Bean"]],
    featured: true,
    variants: [[50, 42_000, 30], [100, 72_000, 3]],
  },
  {
    name: "Royal Oud",
    slug: "royal-oud",
    gender: "UNISEX",
    category: "oud",
    description: "Precious agarwood with saffron and rose. An evening signature.",
    notes: [["Saffron"], ["Oud", "Rose"], ["Sandalwood", "Patchouli"]],
    featured: true,
    variants: [[30, 38_000, 15], [75, 85_000, 8, 95_000]],
  },
  {
    name: "Citrus Bloom",
    slug: "citrus-bloom",
    gender: "UNISEX",
    category: "fresh",
    description: "Sparkling citrus over neroli and white musk. Bright and easy to wear.",
    notes: [["Lemon", "Mandarin", "Grapefruit"], ["Neroli", "Orange Blossom"], ["White Musk"]],
    variants: [[100, 35_000, 40]],
  },
  {
    name: "Amber Nights",
    slug: "amber-nights",
    gender: "UNISEX",
    category: "woody",
    description: "Glowing amber, vanilla and labdanum, like candlelight on warm skin.",
    notes: [["Bergamot"], ["Amber", "Labdanum"], ["Vanilla", "Musk"]],
    featured: true,
    variants: [[50, 40_000, 20], [100, 68_000, 10]],
  },
  {
    name: "Santal Dune",
    slug: "santal-dune",
    gender: "UNISEX",
    category: "woody",
    description: "Creamy sandalwood and fig leaf over sun-warmed sand.",
    notes: [["Fig Leaf"], ["Sandalwood", "Iris"], ["Cashmere Wood", "Musk"]],
    variants: [[50, 48_000, 0], [100, 82_000, 6]],
  },
  {
    name: "Jasmine Silk",
    slug: "jasmine-silk",
    gender: "WOMEN",
    category: "floral",
    description: "Night-blooming jasmine and tuberose softened with silky musk.",
    notes: [["Pear", "Green Tea"], ["Jasmine Sambac", "Tuberose"], ["White Musk", "Benzoin"]],
    variants: [[30, 28_000, 18], [50, 44_000, 14]],
  },
  {
    name: "Midnight Oud",
    slug: "midnight-oud",
    gender: "MEN",
    category: "oud",
    description: "Smoky oud and incense with a dark plum heart.",
    notes: [["Plum", "Saffron"], ["Oud", "Incense"], ["Leather", "Patchouli"]],
    variants: [[50, 55_000, 9], [100, 92_000, 4]],
  },
];

const category = (slug: string) => {
  const c = mockCategories.find((x) => x.slug === slug)!;
  return { id: c.id, name: c.name, slug: c.slug };
};

const toVariants = (s: Seed): VariantDTO[] =>
  s.variants.map(([sizeMl, price, stock, compareAt]) => ({
    id: `var_${s.slug}_${sizeMl}`,
    sizeMl,
    sku: `${s.slug.split("-").map((w) => w[0]!.toUpperCase()).join("")}-${sizeMl}`,
    price: naira(price),
    compareAtPrice: compareAt ? naira(compareAt) : null,
    stock,
    isActive: true,
  }));

export const mockProductDetails: ProductDetailDTO[] = seeds.map((s) => ({
  id: `prod_${s.slug}`,
  name: s.name,
  slug: s.slug,
  brand: "AuraScentHaus",
  gender: s.gender,
  isFeatured: Boolean(s.featured),
  isActive: true,
  category: category(s.category),
  description: s.description,
  topNotes: s.notes[0],
  heartNotes: s.notes[1],
  baseNotes: s.notes[2],
  images: [], // no photos yet: the UI shows an illustrated bottle instead
  variants: toVariants(s),
}));

export const mockProducts: ProductListItemDTO[] = mockProductDetails.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  gender: p.gender,
  isFeatured: p.isFeatured,
  isActive: p.isActive,
  image: null,
  priceFrom: Math.min(...p.variants.map((v) => v.price)),
  category: p.category,
}));

export const mockFeaturedProducts = mockProducts.filter((p) => p.isFeatured);

export const findMockProduct = (slug: string) => mockProductDetails.find((p) => p.slug === slug);
export const findMockProductById = (id: string) => mockProductDetails.find((p) => p.id === id);
export const mockProductsInCategory = (slug: string) => mockProducts.filter((p) => p.category?.slug === slug);
export const findMockCategory = (slug: string) => mockCategories.find((c) => c.slug === slug);

import { describe, expect, it } from "vitest";
import {
  formatSize,
  productQuerySchema,
  updateAddressSchema,
  updateCategorySchema,
  updateProductSchema,
  updateVariantSchema,
} from "@aurascenthaus/shared";
import { toProductDetail } from "./products.mapper.js";

type Row = Parameters<typeof toProductDetail>[0];

const product = (category: Partial<NonNullable<Row["category"]>> | null): Row =>
  ({
    id: "p1",
    name: "Test",
    slug: "test",
    brand: null,
    gender: "UNISEX",
    isFeatured: false,
    isActive: true,
    description: "",
    topNotes: ["Bergamot"],
    heartNotes: ["Rose"],
    baseNotes: ["Musk"],
    images: [],
    variants: [
      { id: "v1", sizeMl: 200, sizeUnit: "G", sku: "A", price: 100, compareAtPrice: null, stock: 1, isActive: true },
      { id: "v2", sizeMl: 300, sizeUnit: "G", sku: "B", price: 200, compareAtPrice: null, stock: 1, isActive: false },
    ],
    scentFamilies: [
      { id: "s1", name: "Oud", slug: "oud", isActive: true },
      { id: "s2", name: "Old", slug: "old", isActive: false },
    ],
    category: category && {
      id: "c1",
      name: "Category",
      slug: "category",
      defaultSizeUnit: "ML",
      isActive: true,
      hasFragrancePyramid: false,
      usesGender: false,
      parent: null,
      ...category,
    },
  }) as unknown as Row;

describe("fragrance pyramid", () => {
  it("shows notes to shoppers in a pyramid category", () => {
    expect(toProductDetail(product({ hasFragrancePyramid: true })).topNotes).toEqual(["Bergamot"]);
  });

  it("shows notes in a subcategory of a pyramid category", () => {
    const parent = { isActive: true, hasFragrancePyramid: true, usesGender: false, parent: null };
    expect(toProductDetail(product({ parent })).heartNotes).toEqual(["Rose"]);
  });

  it("returns empty arrays to shoppers everywhere else", () => {
    const detail = toProductDetail(product({ hasFragrancePyramid: false }));
    expect([detail.topNotes, detail.heartNotes, detail.baseNotes]).toEqual([[], [], []]);
  });

  it("keeps stored notes visible to admins, so a move back restores them", () => {
    expect(toProductDetail(product({ hasFragrancePyramid: false }), true).baseNotes).toEqual(["Musk"]);
  });

  it("returns empty arrays for a product with no category", () => {
    expect(toProductDetail(product(null)).topNotes).toEqual([]);
  });
});

describe("what shoppers can see of a product", () => {
  it("hides inactive sizes and scent families from shoppers only", () => {
    const shopper = toProductDetail(product({}));
    expect(shopper.variants.map((v) => v.id)).toEqual(["v1"]);
    expect(shopper.scentFamilies.map((s) => s.slug)).toEqual(["oud"]);

    const admin = toProductDetail(product({}), true);
    expect(admin.variants).toHaveLength(2);
    expect(admin.scentFamilies).toHaveLength(2);
  });

  it("labels sizes with their unit", () => {
    expect(toProductDetail(product({})).variants[0]?.sizeLabel).toBe("200 g");
  });
});

describe("formatSize", () => {
  it("reads naturally for each unit", () => {
    expect(formatSize(50, "ML")).toBe("50 ml");
    expect(formatSize(200, "G")).toBe("200 g");
    expect(formatSize(1, "PIECE")).toBe("Single item");
    expect(formatSize(3, "PIECE")).toBe("Set of 3");
  });
  it("treats a missing unit as ml, like older data", () => {
    expect(formatSize(100)).toBe("100 ml");
  });
});

// Regression: in Zod 4 a default still applies after .partial(), so a PATCH of one field
// reset others, e.g. changing a price set stock to 0.
describe("partial updates only change what was sent", () => {
  it("variants", () => {
    expect(updateVariantSchema.parse({ price: 100 })).toEqual({ price: 100 });
    expect(updateVariantSchema.parse({ isActive: false })).toEqual({ isActive: false });
  });
  it("products", () => {
    expect(updateProductSchema.parse({ name: "New name" })).toEqual({ name: "New name" });
  });
  it("categories", () => {
    expect(updateCategorySchema.parse({ position: 2 })).toEqual({ position: 2 });
  });
  it("addresses", () => {
    expect(updateAddressSchema.parse({ isDefault: true })).toEqual({ isDefault: true });
  });
});

describe("product filters", () => {
  it("splits scent families on commas", () => {
    expect(productQuerySchema.parse({ scent: "oud, woody" }).scent).toEqual(["oud", "woody"]);
  });
  it("reads numbers and booleans from the URL", () => {
    const query = productQuerySchema.parse({ minPrice: "1000", maxPrice: "5000", inStock: "true" });
    expect(query).toMatchObject({ minPrice: 1000, maxPrice: 5000, inStock: true });
  });
  it("rejects a badly formed scent slug", () => {
    expect(() => productQuerySchema.parse({ scent: "Not Valid" })).toThrow();
  });
});

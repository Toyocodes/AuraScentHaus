import { describe, expect, it } from "vitest";
import {
  activeCategoryIds,
  inheritedFlags,
  parentProblem,
  subtreeIds,
  totalCounts,
  type CategoryNode,
} from "./category-tree.js";

const node = (id: string, parentId: string | null, extra: Partial<CategoryNode> = {}): CategoryNode => ({
  id,
  parentId,
  isActive: true,
  hasFragrancePyramid: false,
  usesGender: false,
  ...extra,
});

const rows = [
  node("personal", null, { usesGender: true }),
  node("perfumes", "personal", { hasFragrancePyramid: true }),
  node("extrait", "perfumes"),
  node("mists", "personal"),
  node("home", null),
  node("candles", "home"),
];

describe("subtreeIds", () => {
  it("includes the category and everything below it", () => {
    expect(subtreeIds(rows, "personal").sort()).toEqual(["extrait", "mists", "perfumes", "personal"]);
  });
  it("is just the category when it has no children", () => {
    expect(subtreeIds(rows, "candles")).toEqual(["candles"]);
  });
});

describe("inheritedFlags", () => {
  it("gives the pyramid to subcategories of Perfumes", () => {
    expect(inheritedFlags(rows, "extrait").hasFragrancePyramid).toBe(true);
  });
  it("doesn't give the pyramid to siblings or parents of Perfumes", () => {
    expect(inheritedFlags(rows, "mists").hasFragrancePyramid).toBe(false);
    expect(inheritedFlags(rows, "personal").hasFragrancePyramid).toBe(false);
    expect(inheritedFlags(rows, "candles").hasFragrancePyramid).toBe(false);
  });
  it("passes gender down from the main category", () => {
    expect(inheritedFlags(rows, "mists").usesGender).toBe(true);
    expect(inheritedFlags(rows, "candles").usesGender).toBe(false);
  });
});

describe("activeCategoryIds", () => {
  it("hides subcategories of a deactivated parent", () => {
    const list = rows.map((r) => (r.id === "personal" ? { ...r, isActive: false } : r));
    expect(activeCategoryIds(list).sort()).toEqual(["candles", "home"]);
  });
});

describe("parentProblem", () => {
  it("allows a valid move", () => {
    expect(parentProblem(rows, "candles", "personal")).toBeNull();
  });
  it("refuses a category as its own parent", () => {
    expect(parentProblem(rows, "home", "home")).toMatch(/own parent/);
  });
  it("refuses a loop", () => {
    expect(parentProblem(rows, "personal", "extrait")).toMatch(/own subcategory/);
  });
  it("refuses a parent that doesn't exist", () => {
    expect(parentProblem(rows, "home", "nope")).toMatch(/doesn't exist/);
  });
  it("refuses a fourth level", () => {
    expect(parentProblem(rows, null, "extrait")).toMatch(/3 levels/);
    expect(parentProblem(rows, null, "perfumes")).toBeNull();
  });
  it("counts the moving category's own children towards the depth", () => {
    // personal has 3 levels of its own, so it can't go under anything.
    expect(parentProblem(rows, "personal", "home")).toMatch(/3 levels/);
  });
});

describe("totalCounts", () => {
  it("adds subcategory products to their parents", () => {
    const counted = rows.map((r) => ({ ...r, directCount: r.id === "extrait" ? 2 : r.id === "mists" ? 1 : 0 }));
    const totals = totalCounts(counted);
    expect(totals.get("personal")).toBe(3);
    expect(totals.get("perfumes")).toBe(2);
    expect(totals.get("home")).toBe(0);
  });
});

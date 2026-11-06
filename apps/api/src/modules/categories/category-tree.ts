/**
 * Working with the category tree. These are plain functions over a list of rows, so they are
 * easy to test. The table is small (dozens of rows), so loading it whole per request is fine.
 */

export const MAX_CATEGORY_DEPTH = 3;

export interface CategoryNode {
  id: string;
  parentId: string | null;
  isActive: boolean;
  hasFragrancePyramid: boolean;
  usesGender: boolean;
}

function indexById<T extends CategoryNode>(rows: readonly T[]) {
  return new Map(rows.map((r) => [r.id, r]));
}

/** The category and everything below it. */
export function subtreeIds(rows: readonly CategoryNode[], rootId: string): string[] {
  const ids = [rootId];
  for (let i = 0; i < ids.length; i++) {
    for (const row of rows) {
      if (row.parentId === ids[i] && !ids.includes(row.id)) ids.push(row.id);
    }
  }
  return ids;
}

/** The category followed by its parents, up to the main category. Stops safely on a loop. */
export function ancestorChain<T extends CategoryNode>(rows: readonly T[], id: string): T[] {
  const byId = indexById(rows);
  const chain: T[] = [];
  const seen = new Set<string>();
  let current = byId.get(id);
  while (current && !seen.has(current.id)) {
    chain.push(current);
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

/** A category is only visible if it and every parent are active. */
export function activeCategoryIds(rows: readonly CategoryNode[]): string[] {
  return rows.filter((r) => ancestorChain(rows, r.id).every((c) => c.isActive)).map((r) => r.id);
}

/** These settings pass down: a subcategory of Perfumes has the pyramid too. */
export function inheritedFlags(rows: readonly CategoryNode[], id: string) {
  const chain = ancestorChain(rows, id);
  return {
    hasFragrancePyramid: chain.some((c) => c.hasFragrancePyramid),
    usesGender: chain.some((c) => c.usesGender),
  };
}

/** How many levels the category's own branch goes down, counting itself as 1. */
function branchHeight(rows: readonly CategoryNode[], id: string): number {
  const children = rows.filter((r) => r.parentId === id);
  return 1 + Math.max(0, ...children.map((c) => branchHeight(rows, c.id)));
}

/**
 * Why `categoryId` can't move under `parentId`, or null if it can.
 * Pass categoryId = null for a new category.
 */
export function parentProblem(rows: readonly CategoryNode[], categoryId: string | null, parentId: string): string | null {
  if (categoryId === parentId) return "A category can't be its own parent";
  if (!rows.some((r) => r.id === parentId)) return "That parent category doesn't exist";
  if (categoryId && subtreeIds(rows, categoryId).includes(parentId)) {
    return "A category can't move inside its own subcategory";
  }
  const parentDepth = ancestorChain(rows, parentId).length;
  const height = categoryId ? branchHeight(rows, categoryId) : 1;
  if (parentDepth + height > MAX_CATEGORY_DEPTH) {
    return `Categories can only go ${MAX_CATEGORY_DEPTH} levels deep`;
  }
  return null;
}

/** Sum each category's products with those of its subcategories. */
export function totalCounts(rows: readonly (CategoryNode & { directCount: number })[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const inBranch = new Set(subtreeIds(rows, row.id));
    totals.set(row.id, rows.filter((r) => inBranch.has(r.id)).reduce((sum, r) => sum + r.directCount, 0));
  }
  return totals;
}

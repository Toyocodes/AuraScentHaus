import type { CategoryDTO } from "@aurascenthaus/shared";

/** A category and the depth it sits at (0 = main category). */
export interface OrderedCategory<T> {
  category: T;
  depth: number;
}

/** Parents followed by their children, in display order. The API list is already sorted by position. */
export function inTreeOrder<T extends Pick<CategoryDTO, "id" | "parentId">>(
  categories: readonly T[],
  parentId: string | null = null,
  depth = 0,
): OrderedCategory<T>[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .flatMap((category) => [{ category, depth }, ...inTreeOrder(categories, category.id, depth + 1)]);
}

/** Dropdown options reading "Personal Fragrance › Perfumes". */
export function categoryOptions(
  categories: readonly Pick<CategoryDTO, "id" | "name" | "parentId">[],
  { exclude }: { exclude?: (id: string) => boolean } = {},
) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const pathOf = (c: Pick<CategoryDTO, "name" | "parentId">): string => {
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    return parent ? `${pathOf(parent)} › ${c.name}` : c.name;
  };
  return inTreeOrder(categories)
    .filter(({ category }) => !exclude?.(category.id))
    .map(({ category }) => ({ value: category.id, label: pathOf(category) }));
}

/** The category and everything under it, which can't become its parent. */
export function branchIds(categories: readonly Pick<CategoryDTO, "id" | "parentId">[], rootId: string): Set<string> {
  return new Set([rootId, ...inTreeOrder(categories, rootId).map(({ category }) => category.id)]);
}

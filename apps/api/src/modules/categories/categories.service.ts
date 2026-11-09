import type {
  CategoryDetailDTO,
  CategoryDTO,
  CategoryInput,
  CategoryTreeDTO,
  CategoryWithCountDTO,
  UpdateCategoryInput,
} from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Category } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { slugify, uniqueSlug } from "../../utils/slugify.js";
import { activeCategoryIds, inheritedFlags, parentProblem, totalCounts, type CategoryNode } from "./category-tree.js";

const slugTaken = async (slug: string) => !!(await prisma.category.findUnique({ where: { slug } }));

const ORDER = [{ position: "asc" }, { name: "asc" }] as const;

/** Every category, for working out the tree. Also used to filter products. */
export function loadCategoryRows() {
  return prisma.category.findMany({ orderBy: [...ORDER] });
}

/** `rows` must be the full list, so settings inherited from parents are included. */
export function toCategoryDTO(c: Category, rows: readonly CategoryNode[]): CategoryDTO {
  const flags = inheritedFlags(rows, c.id);
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    position: c.position,
    isActive: c.isActive,
    hasFragrancePyramid: flags.hasFragrancePyramid,
    usesGender: flags.usesGender,
    defaultSizeUnit: c.defaultSizeUnit,
    own: { hasFragrancePyramid: c.hasFragrancePyramid, usesGender: c.usesGender },
  };
}

async function loadWithCounts(activeProductsOnly: boolean): Promise<CategoryWithCountDTO[]> {
  const rows = await prisma.category.findMany({
    orderBy: [...ORDER],
    include: { _count: { select: { products: activeProductsOnly ? { where: { isActive: true, priceFrom: { not: null } } } : true } } },
  });
  const totals = totalCounts(rows.map((r) => ({ ...r, directCount: r._count.products })));
  return rows.map((r) => ({
    ...toCategoryDTO(r, rows),
    productCount: totals.get(r.id) ?? 0,
    directProductCount: r._count.products,
  }));
}

function toTree(list: CategoryWithCountDTO[], parentId: string | null = null): CategoryTreeDTO[] {
  return list.filter((c) => c.parentId === parentId).map((c) => ({ ...c, children: toTree(list, c.id) }));
}

/**
 * For shoppers: active categories that have something to show, so the menu never leads to an
 * empty shelf. New categories appear by themselves once they have a product on sale.
 */
export async function listPublicCategories(): Promise<CategoryWithCountDTO[]> {
  const list = await loadWithCounts(true);
  const active = new Set(activeCategoryIds(list));
  return list.filter((c) => active.has(c.id) && c.productCount > 0);
}

export async function getPublicCategoryTree(): Promise<CategoryTreeDTO[]> {
  return toTree(await listPublicCategories());
}

/** For admins: everything, including empty and inactive categories. */
export const listAdminCategories = () => loadWithCounts(false);
export const getAdminCategoryTree = async () => toTree(await loadWithCounts(false));

export async function getCategoryBySlug(slug: string): Promise<CategoryDetailDTO> {
  const rows = await loadCategoryRows();
  const category = rows.find((c) => c.slug === slug);
  if (!category || !activeCategoryIds(rows).includes(category.id)) throw ApiError.notFound("Category");

  const shown = new Set((await listPublicCategories()).map((c) => c.id));
  const parent = rows.find((c) => c.id === category.parentId);

  return {
    ...toCategoryDTO(category, rows),
    parent: parent ? { id: parent.id, name: parent.name, slug: parent.slug } : null,
    children: rows
      .filter((c) => c.parentId === category.id && shown.has(c.id))
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  };
}

export async function createCategory(input: CategoryInput) {
  const rows = await loadCategoryRows();
  if (input.parentId) {
    const problem = parentProblem(rows, null, input.parentId);
    if (problem) throw ApiError.badRequest(problem, "INVALID_PARENT");
  }

  const slug = input.slug ?? (await uniqueSlug(input.name, slugTaken));
  const category = await prisma.category.create({ data: { ...input, slug } });
  return toCategoryDTO(category, [...rows, category]);
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const rows = await loadCategoryRows();
  if (!rows.some((c) => c.id === id)) throw ApiError.notFound("Category");
  if (input.parentId) {
    const problem = parentProblem(rows, id, input.parentId);
    if (problem) throw ApiError.badRequest(problem, "INVALID_PARENT");
  }

  const data = { ...input, ...(input.slug && { slug: slugify(input.slug) }) };
  const category = await prisma.category.update({ where: { id }, data });
  return toCategoryDTO(category, rows.map((c) => (c.id === id ? category : c)));
}

export async function setCategoryImage(id: string, imageUrl: string) {
  const rows = await loadCategoryRows();
  const category = await prisma.category.update({ where: { id }, data: { imageUrl } });
  return toCategoryDTO(category, rows.map((c) => (c.id === id ? category : c)));
}

/**
 * A category with products can only be deleted by moving them somewhere else first, in one
 * transaction. Subcategories must be moved by hand, and a category with fragrance notes
 * switched on must have them switched off first.
 */
export async function deleteCategory(id: string, reassignTo?: string) {
  await prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!category) throw ApiError.notFound("Category");

    if (category.hasFragrancePyramid) {
      throw ApiError.conflict(`${category.name} has fragrance notes switched on. Edit it and switch them off first, or deactivate it instead.`, "CATEGORY_PROTECTED");
    }
    if (category._count.children > 0) {
      throw ApiError.conflict(`Move or delete the ${category._count.children} subcategories of ${category.name} first.`, "CATEGORY_HAS_CHILDREN", {
        children: category._count.children,
      });
    }

    if (category._count.products > 0) {
      if (!reassignTo) {
        throw ApiError.conflict(`${category.name} still has ${category._count.products} products. Choose where to move them.`, "CATEGORY_HAS_PRODUCTS", {
          products: category._count.products,
        });
      }
      if (reassignTo === id) throw ApiError.badRequest("Choose a different category to move the products to", "INVALID_REASSIGN");
      const target = await tx.category.findUnique({ where: { id: reassignTo }, select: { id: true } });
      if (!target) throw ApiError.badRequest("The category to move products to doesn't exist", "INVALID_REASSIGN");
      await tx.product.updateMany({ where: { categoryId: id }, data: { categoryId: reassignTo } });
    }

    await tx.category.delete({ where: { id } });
  });
}

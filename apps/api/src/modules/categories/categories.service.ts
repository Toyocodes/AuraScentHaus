import type { CategoryDTO, CategoryInput, UpdateCategoryInput } from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Category } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { slugify, uniqueSlug } from "../../utils/slugify.js";

export function toCategoryDTO(c: Category): CategoryDTO {
  return { id: c.id, name: c.name, slug: c.slug, description: c.description, imageUrl: c.imageUrl };
}

const slugTaken = async (slug: string) => !!(await prisma.category.findUnique({ where: { slug } }));

export async function listCategories() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return rows.map((c) => ({ ...toCategoryDTO(c), productCount: c._count.products }));
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw ApiError.notFound("Category");
  return toCategoryDTO(category);
}

export async function createCategory(input: CategoryInput) {
  const slug = input.slug ?? (await uniqueSlug(input.name, slugTaken));
  const category = await prisma.category.create({ data: { ...input, slug } });
  return toCategoryDTO(category);
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const data = { ...input, ...(input.slug && { slug: slugify(input.slug) }) };
  const category = await prisma.category.update({ where: { id }, data });
  return toCategoryDTO(category);
}

/** Products in the category are kept (their categoryId becomes null). */
export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
}

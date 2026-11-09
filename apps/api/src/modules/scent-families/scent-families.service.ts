import type { ScentFamilyDTO, ScentFamilyInput, UpdateScentFamilyInput } from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { slugify, uniqueSlug } from "../../utils/slugify.js";

const slugTaken = async (slug: string) => !!(await prisma.scentFamily.findUnique({ where: { slug } }));

const ON_SALE = { isActive: true, priceFrom: { not: null } } as const;

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
  _count: { products: number };
};

function toDTO(row: Row): ScentFamilyDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    position: row.position,
    isActive: row.isActive,
    productCount: row._count.products,
  };
}

const ORDER = [{ position: "asc" }, { name: "asc" }] as const;

/** For shoppers: active families. The count is how many products are on sale in each. */
export async function listPublicScentFamilies() {
  const rows = await prisma.scentFamily.findMany({
    where: { isActive: true },
    orderBy: [...ORDER],
    include: { _count: { select: { products: { where: ON_SALE } } } },
  });
  return rows.map(toDTO);
}

/** For admins: all families, counting every product that uses them. */
export async function listAdminScentFamilies() {
  const rows = await prisma.scentFamily.findMany({
    orderBy: [...ORDER],
    include: { _count: { select: { products: true } } },
  });
  return rows.map(toDTO);
}

export async function createScentFamily(input: ScentFamilyInput) {
  const slug = input.slug ?? (await uniqueSlug(input.name, slugTaken));
  const row = await prisma.scentFamily.create({
    data: { ...input, slug },
    include: { _count: { select: { products: true } } },
  });
  return toDTO(row);
}

export async function updateScentFamily(id: string, input: UpdateScentFamilyInput) {
  const row = await prisma.scentFamily.update({
    where: { id },
    data: { ...input, ...(input.slug && { slug: slugify(input.slug) }) },
    include: { _count: { select: { products: true } } },
  });
  return toDTO(row);
}

export async function setScentFamilyImage(id: string, imageUrl: string) {
  const row = await prisma.scentFamily.update({
    where: { id },
    data: { imageUrl },
    include: { _count: { select: { products: true } } },
  });
  return toDTO(row);
}

/** Refused while products use it, so nothing loses its scent family by accident. */
export async function deleteScentFamily(id: string) {
  const row = await prisma.scentFamily.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!row) throw ApiError.notFound("Scent family");
  if (row._count.products > 0) {
    throw ApiError.conflict(
      `${row._count.products} products use ${row.name}. Remove it from them first, or deactivate it to hide it from shoppers.`,
      "SCENT_FAMILY_IN_USE",
      { products: row._count.products },
    );
  }
  await prisma.scentFamily.delete({ where: { id } });
}

import type { PaginationInput, Paginated } from "@aurascenthaus/shared";

export function toSkipTake({ page, limit }: PaginationInput) {
  return { skip: (page - 1) * limit, take: limit };
}

export function paginated<T>(data: T[], total: number, { page, limit }: PaginationInput): Paginated<T> {
  return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

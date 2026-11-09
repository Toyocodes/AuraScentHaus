/**
 * Sorts product ids by units sold, most first. Products that sold the same amount (including
 * none) keep the order they came in, so pass them newest first.
 */
export function rankByUnitsSold(ids: readonly string[], sold: ReadonlyMap<string, number>): string[] {
  return ids
    .map((id, index) => ({ id, index, sold: sold.get(id) ?? 0 }))
    .sort((a, b) => b.sold - a.sold || a.index - b.index)
    .map((p) => p.id);
}

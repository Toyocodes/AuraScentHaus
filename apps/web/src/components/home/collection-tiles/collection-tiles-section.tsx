"use client";

import { useCategoryTree } from "@/hooks/categories";
import { CollectionTiles } from "./collection-tiles";

/** Home page collections, from the main categories with products on sale. Hidden until they load. */
export function CollectionTilesSection() {
  const { data: categories = [] } = useCategoryTree();
  return <CollectionTiles categories={categories} />;
}

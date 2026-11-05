"use client";

import { useCategories } from "@/hooks/categories";
import { CollectionTiles } from "./collection-tiles";

/** Home page collections, connected to GET /categories. Hidden until they load (or if there are none). */
export function CollectionTilesSection() {
  const { data: categories = [] } = useCategories();
  return <CollectionTiles categories={categories} />;
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CategoryTreeDTO } from "@aurascenthaus/shared";

const ServerTreeContext = createContext<CategoryTreeDTO[] | null>(null);

/**
 * Hands the categories the server loaded to everything below, so the navbar, footer and home page
 * show them in the very first HTML and the menu doesn't change once the page has loaded.
 * (Passed down as plain data rather than put in the query cache: the cache stamps the time,
 * which Next.js doesn't allow while it prerenders a page.)
 */
export function CategoryTreeProvider({ tree, children }: { tree: CategoryTreeDTO[] | null; children: ReactNode }) {
  return <ServerTreeContext.Provider value={tree}>{children}</ServerTreeContext.Provider>;
}

/** The categories the server rendered the page with, or null if it couldn't load them. */
export const useServerCategoryTree = () => useContext(ServerTreeContext);

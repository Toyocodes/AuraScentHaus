import type { ReactNode } from "react";
import { CategoryTreeProvider } from "@/components/providers/category-tree-provider";
import { getCategoryTree } from "@/lib/catalog-metadata";
import { Footer } from "../footer/footer";
import { SiteNavbar } from "../navbar/site-navbar";

/**
 * Navbar + page + footer. The navbar reads the signed-in user and the bag itself.
 * The categories are loaded here on the server, so the menu is complete in the first HTML.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const categoryTree = await getCategoryTree();

  return (
    <CategoryTreeProvider tree={categoryTree}>
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CategoryTreeProvider>
  );
}

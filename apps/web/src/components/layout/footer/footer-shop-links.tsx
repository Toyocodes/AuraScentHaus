"use client";

import Link from "next/link";
import { useCategoryTree } from "@/hooks/categories";

const LINK = "text-espresso-foreground/75 transition-colors hover:text-espresso-foreground";

/** The footer's shop links, from the same categories as the menu. */
export function FooterShopLinks() {
  const { data: categories = [] } = useCategoryTree();

  return (
    <ul className="space-y-2.5 text-sm">
      <li>
        <Link href="/shop" className={LINK}>
          Shop all
        </Link>
      </li>
      {categories.map((c) => (
        <li key={c.id}>
          <Link href={`/shop/${c.slug}`} className={LINK}>
            {c.name}
          </Link>
        </li>
      ))}
      <li>
        <Link href="/shop?sort=newest" className={LINK}>
          New Arrivals
        </Link>
      </li>
    </ul>
  );
}

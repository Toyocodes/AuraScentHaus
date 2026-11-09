"use client";

import Image from "next/image";
import Link from "next/link";
import type { CategoryTreeDTO, ScentFamilyDTO } from "@aurascenthaus/shared";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/** A top-level item that is a plain link, styled like the menu triggers. */
const TOP_LINK =
  "flex h-11 items-center rounded-none px-3 text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent lg:px-4";

const TOP_LEVEL =
  "h-11 rounded-none bg-transparent px-3 text-[0.75rem] font-normal tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground data-open:bg-transparent data-open:text-foreground data-open:hover:bg-transparent data-open:focus:bg-transparent lg:px-4";

/** Sits under the whole header, full width. */
const PANEL =
  "right-0 left-0 w-full rounded-none border-t bg-background p-0 shadow-[0_30px_50px_-30px_rgb(60_40_25/0.25)] ring-0 md:w-full group-data-[viewport=false]/navigation-menu:mt-0 group-data-[viewport=false]/navigation-menu:rounded-none group-data-[viewport=false]/navigation-menu:bg-background group-data-[viewport=false]/navigation-menu:ring-0";

function PlainLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <NavigationMenuLink asChild className={cn("inline-flex rounded-none p-0 hover:bg-transparent focus:bg-transparent", className)}>
      <Link href={href}>{children}</Link>
    </NavigationMenuLink>
  );
}

function ChildLinks({ category }: { category: CategoryTreeDTO }) {
  return (
    <ul className="space-y-2.5">
      {category.children.map((child) => (
        <li key={child.id}>
          <PlainLink href={`/shop/${child.slug}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {child.name}
          </PlainLink>
        </li>
      ))}
    </ul>
  );
}

interface MegaMenuProps {
  categories: CategoryTreeDTO[];
  scentFamilies: ScentFamilyDTO[];
}

/** The desktop menu, built from the API. Opens on hover or click, and works with the keyboard. */
export function MegaMenu({ categories, scentFamilies }: MegaMenuProps) {
  return (
    // Everything here is "static" (including the wrapper Radix adds around the list), so each panel
    // lines up with the whole header rather than its own menu item.
    <NavigationMenu viewport={false} delayDuration={80} className="static max-w-none [&>div]:static!" aria-label="Shop">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={TOP_LINK}>
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem className="static">
          <NavigationMenuTrigger className={TOP_LEVEL}>Shop</NavigationMenuTrigger>
          <NavigationMenuContent className={PANEL}>
            <div className="container-page flex flex-wrap gap-x-14 gap-y-10 py-10">
              {categories.map((category) => (
                <div key={category.id} className="min-w-40 space-y-4">
                  <PlainLink href={`/shop/${category.slug}`} className="font-heading text-xl">
                    {category.name}
                  </PlainLink>
                  <ChildLinks category={category} />
                </div>
              ))}
              {scentFamilies.length > 0 && (
                <div className="min-w-40 space-y-4">
                  <p className="font-heading text-xl">By scent</p>
                  <ul className="space-y-2.5">
                    {scentFamilies.map((family) => (
                      <li key={family.id}>
                        <PlainLink
                          href={`/shop?scent=${family.slug}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {family.name}
                        </PlainLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="min-w-40 self-end">
                <PlainLink href="/shop" className="text-xs tracking-[0.2em] text-gold uppercase">
                  Shop everything →
                </PlainLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {categories.map((category) => (
          <NavigationMenuItem key={category.id} className="static">
            <NavigationMenuTrigger className={TOP_LEVEL}>{category.name}</NavigationMenuTrigger>
            <NavigationMenuContent className={PANEL}>
              <div className="container-page grid gap-12 py-10 md:grid-cols-[16rem_1fr_auto]">
                <div className="space-y-3">
                  <p className="font-heading text-3xl leading-tight">{category.name}</p>
                  {category.description && <p className="text-sm leading-relaxed text-muted-foreground">{category.description}</p>}
                  <PlainLink href={`/shop/${category.slug}`} className="text-xs tracking-[0.2em] text-gold uppercase">
                    Shop all →
                  </PlainLink>
                </div>
                <div className="columns-2 gap-10 lg:columns-3">
                  <ChildLinks category={category} />
                </div>
                {category.imageUrl && (
                  <div className="relative hidden aspect-[4/3] w-64 overflow-hidden rounded-sm lg:block">
                    <Image src={category.imageUrl} alt="" fill sizes="256px" className="object-cover" />
                  </div>
                )}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={TOP_LINK}>
            <Link href="/shop?sort=newest">New Arrivals</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

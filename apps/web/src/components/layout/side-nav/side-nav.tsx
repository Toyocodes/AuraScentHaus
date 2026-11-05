"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SideNavItem {
  href: string;
  label: string;
  /** Match only the exact path (for index routes like /admin). */
  exact?: boolean;
}

/**
 * The pathname is only known at request time on dynamic routes, so the highlighted
 * version streams in. The fallback shows the same links without a highlight.
 */
export function SideNav({ items }: { items: SideNavItem[] }) {
  return (
    <Suspense fallback={<NavLinks items={items} pathname={null} />}>
      <ActiveSideNav items={items} />
    </Suspense>
  );
}

function ActiveSideNav({ items }: { items: SideNavItem[] }) {
  return <NavLinks items={items} pathname={usePathname()} />;
}

function NavLinks({ items, pathname }: { items: SideNavItem[]; pathname: string | null }) {
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        const active = pathname !== null && (item.exact ? pathname === item.href : pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

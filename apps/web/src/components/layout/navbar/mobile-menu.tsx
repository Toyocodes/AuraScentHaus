"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "./nav-links";

/** Slide-in menu for small screens. */
export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-[0.25em] uppercase">AuraScentHaus</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4">
          {NAV_LINKS.map((l) => (
            <SheetClose asChild key={l.href}>
              <Link href={l.href} className="border-b py-4 font-heading text-2xl">
                {l.label}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link href="/account" className="py-4 text-sm text-muted-foreground">
              My account
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

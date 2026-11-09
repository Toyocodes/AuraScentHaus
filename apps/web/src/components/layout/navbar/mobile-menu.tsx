"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import type { CategoryTreeDTO, ScentFamilyDTO } from "@aurascenthaus/shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ROW = "block border-b py-4 font-heading text-2xl";
const CHILD = "block py-3 text-base text-muted-foreground";

function CloseLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link href={href} className={className}>
        {children}
      </Link>
    </SheetClose>
  );
}

interface MobileMenuProps {
  categories: CategoryTreeDTO[];
  scentFamilies: ScentFamilyDTO[];
}

/** Slide-in menu for small screens, with each main category opening to show its subcategories. */
export function MobileMenu({ categories, scentFamilies }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-[0.25em] uppercase">AuraScentHaus</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4 pb-8" aria-label="Shop">
          <CloseLink href="/" className={ROW}>
            Home
          </CloseLink>
          <CloseLink href="/shop" className={ROW}>
            Shop all
          </CloseLink>

          <Accordion type="single" collapsible>
            {categories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="py-4 font-heading text-2xl font-normal hover:no-underline">
                  {category.name}
                </AccordionTrigger>
                <AccordionContent>
                  <CloseLink href={`/shop/${category.slug}`} className={`${CHILD} text-foreground`}>
                    All {category.name}
                  </CloseLink>
                  {category.children.map((child) => (
                    <CloseLink key={child.id} href={`/shop/${child.slug}`} className={CHILD}>
                      {child.name}
                    </CloseLink>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
            {scentFamilies.length > 0 && (
              <AccordionItem value="scents">
                <AccordionTrigger className="py-4 font-heading text-2xl font-normal hover:no-underline">By scent</AccordionTrigger>
                <AccordionContent>
                  {scentFamilies.map((family) => (
                    <CloseLink key={family.id} href={`/shop?scent=${family.slug}`} className={CHILD}>
                      {family.name}
                    </CloseLink>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <CloseLink href="/shop?sort=newest" className={ROW}>
            New Arrivals
          </CloseLink>
          <CloseLink href="/account" className="py-4 text-sm text-muted-foreground">
            My account
          </CloseLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

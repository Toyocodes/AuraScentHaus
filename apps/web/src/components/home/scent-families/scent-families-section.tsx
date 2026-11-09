"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/common";
import { useScentFamilies } from "@/hooks/scent-families";

/** "Shop by scent": each family with something on sale, across every kind of product. */
export function ScentFamiliesSection() {
  const { data } = useScentFamilies();
  const families = data?.filter((f) => f.productCount > 0) ?? [];
  if (families.length === 0) return null;

  return (
    <section className="border-t bg-card">
      <div className="container-page space-y-8 py-16 text-center">
        <SectionHeading eyebrow="What do you love?" title="Shop by scent" align="center" />
        <ul className="flex flex-wrap justify-center gap-3">
          {families.map((family) => (
            <li key={family.id}>
              <Link
                href={`/shop?scent=${family.slug}`}
                className="flex items-center gap-3 rounded-full border py-2 pr-6 pl-2 font-heading text-lg transition-colors hover:border-foreground/50"
              >
                {family.imageUrl ? (
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image src={family.imageUrl} alt="" fill sizes="32px" className="object-cover" />
                  </span>
                ) : (
                  <span className="pl-4" aria-hidden />
                )}
                {family.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

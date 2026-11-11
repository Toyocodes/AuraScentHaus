"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/common";
import { ProductVisual } from "@/components/product";
import { useScentFamilies } from "@/hooks/scent-families";

/** "Shop by scent": a picture tile for each family with something on sale, across every kind of product. */
export function ScentFamiliesSection() {
  const { data } = useScentFamilies();
  const families = data?.filter((f) => f.productCount > 0) ?? [];
  if (families.length === 0) return null;

  return (
    <section className="border-t bg-card">
      <div className="container-page space-y-10 py-20">
        <SectionHeading eyebrow="What do you love?" title="Shop by scent" align="center" />
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-8">
          {families.map((family) => (
            <li key={family.id} className="w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
              <Link href={`/shop?scent=${family.slug}`} className="group block space-y-4 text-center">
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-muted">
                  <div className="size-full transition-transform duration-700 group-hover:scale-105">
                    {family.imageUrl ? (
                      <Image
                        src={family.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <ProductVisual name={family.name} compact />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl underline-offset-4 group-hover:underline">{family.name}</h3>
                  {family.description && (
                    <p className="mx-auto line-clamp-2 max-w-60 text-sm text-muted-foreground">{family.description}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

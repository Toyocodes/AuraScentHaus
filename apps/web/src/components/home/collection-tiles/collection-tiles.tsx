import Image from "next/image";
import Link from "next/link";
import type { CategoryDTO } from "@aurascenthaus/shared";
import { SectionHeading } from "@/components/common";
import { ProductVisual } from "@/components/product";

/** One tile per main category, linking to /shop/[slug]. */
export function CollectionTiles({ categories }: { categories: CategoryDTO[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-page space-y-10 py-20">
      <SectionHeading eyebrow="The house" title="Explore by collection" align="center" />
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            className="group relative block aspect-[3/4] w-[calc(50%-0.5rem)] overflow-hidden rounded-sm lg:w-[calc(25%-0.75rem)]"
          >
            <div className="size-full transition-transform duration-700 group-hover:scale-105">
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              ) : (
                <ProductVisual name={c.name} compact />
              )}
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-espresso/75 via-espresso/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-1 p-5 text-espresso-foreground">
              <h3 className="text-3xl">{c.name}</h3>
              {c.description && <p className="line-clamp-2 text-xs text-espresso-foreground/75">{c.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

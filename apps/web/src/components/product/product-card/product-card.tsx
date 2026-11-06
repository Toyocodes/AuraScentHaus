import Image from "next/image";
import Link from "next/link";
import type { ProductListItemDTO } from "@aurascenthaus/shared";
import { Price } from "@/components/common";
import { ProductVisual } from "../product-visual/product-visual";

export function ProductCard({ product }: { product: ProductListItemDTO }) {
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <div className="size-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : (
            <ProductVisual name={product.name} compact />
          )}
        </div>
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-background/85 px-2.5 py-1 text-[0.625rem] tracking-[0.25em] uppercase backdrop-blur">
            Signature
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-background/90 py-2.5 text-center text-[0.6875rem] tracking-[0.25em] uppercase opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Discover
        </span>
      </div>
      <div className="space-y-1.5 text-center">
        <p className="eyebrow">{product.category?.name ?? product.brand}</p>
        <h3 className="font-heading text-xl leading-tight">{product.name}</h3>
        {product.priceFrom !== null && (
          <Price amount={product.priceFrom} prefix="From" className="justify-center text-sm" />
        )}
      </div>
    </Link>
  );
}

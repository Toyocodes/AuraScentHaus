import Link from "next/link";
import type { ProductDetailDTO, VariantDTO } from "@aurascenthaus/shared";
import { humanize } from "@/lib/format";
import { AddToCart } from "../add-to-cart/add-to-cart";
import { ProductGallery } from "../product-gallery/product-gallery";
import { ScentNotes } from "../scent-notes/scent-notes";

interface ProductDetailProps {
  product: ProductDetailDTO;
  isAdding?: boolean;
  onAddToCart?: (variant: VariantDTO) => void | Promise<void>;
}

export function ProductDetail({ product, isAdding, onAddToCart }: ProductDetailProps) {
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:gap-20">
      <ProductGallery images={product.images} name={product.name} />

      <div className="space-y-8 md:sticky md:top-32 md:self-start">
        <div className="space-y-3">
          <nav className="eyebrow flex gap-2" aria-label="Breadcrumb">
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            {product.category && (
              <>
                <span aria-hidden>/</span>
                <Link href={`/shop/${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>
          <h1 className="text-5xl leading-none md:text-6xl">{product.name}</h1>
          <p className="text-sm tracking-wide text-muted-foreground">
            {[product.brand ?? "AuraScentHaus", product.category?.usesGender ? humanize(product.gender) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {product.description && <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>}

        <AddToCart product={product} isPending={isAdding} onAdd={onAddToCart} />

        {product.scentFamilies.length > 0 && (
          <div className="space-y-3">
            <p className="eyebrow text-foreground">Scent family</p>
            <ul className="flex flex-wrap gap-2">
              {product.scentFamilies.map((family) => (
                <li key={family.id}>
                  <Link
                    href={`/shop?scent=${family.slug}`}
                    className="block rounded-full border px-3.5 py-1 text-sm transition-colors hover:border-foreground/50"
                  >
                    {family.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.category?.hasFragrancePyramid && (
          <ScentNotes top={product.topNotes} heart={product.heartNotes} base={product.baseNotes} />
        )}
      </div>
    </div>
  );
}

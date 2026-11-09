"use client";

import { useState } from "react";
import type { ProductDetailDTO, VariantDTO } from "@aurascenthaus/shared";
import { Price } from "@/components/common";
import { Button } from "@/components/ui/button";
import { VariantPicker } from "../variant-picker/variant-picker";

interface AddToCartProps {
  product: ProductDetailDTO;
  isPending?: boolean;
  /** Wire to `useAddToCart()` for signed-in users, or the guest cart store for guests. */
  onAdd?: (variant: VariantDTO) => void | Promise<void>;
}

export function AddToCart({ product, isPending, onAdd }: AddToCartProps) {
  const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock?.id);
  const variant = product.variants.find((v) => v.id === variantId);

  if (!variant) return <p className="text-muted-foreground">Currently unavailable.</p>;

  const outOfStock = variant.stock <= 0;

  return (
    <div className="space-y-6">
      <Price amount={variant.price} compareAt={variant.compareAtPrice} className="text-2xl" />
      <VariantPicker variants={product.variants} value={variantId} onChange={setVariantId} />
      <Button size="lg" className="w-full" disabled={outOfStock || isPending} onClick={() => onAdd?.(variant)}>
        {outOfStock ? "Out of stock" : isPending ? "Adding…" : "Add to bag"}
      </Button>
      
    </div>
  );
}

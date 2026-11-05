"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { MAX_CART_ITEM_QUANTITY, type CartItemDTO } from "@aurascenthaus/shared";
import { Price, QuantityStepper } from "@/components/common";
import { ProductVisual } from "@/components/product";
import { Button } from "@/components/ui/button";

interface CartItemRowProps {
  item: CartItemDTO;
  disabled?: boolean;
  /** Wire to `useUpdateCartItem().mutate({ variantId, quantity })`. */
  onQuantityChange?: (variantId: string, quantity: number) => void;
  /** Wire to `useRemoveCartItem().mutate(variantId)`. */
  onRemove?: (variantId: string) => void;
}

export function CartItemRow({ item, disabled, onQuantityChange, onRemove }: CartItemRowProps) {
  const max = Math.min(item.stock, MAX_CART_ITEM_QUANTITY);
  const href = `/products/${item.product.slug}`;

  return (
    <li className="flex gap-5 py-6">
      <Link href={href} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-28">
        {item.product.image ? (
          <Image src={item.product.image} alt={item.product.name} fill sizes="112px" className="object-cover" />
        ) : (
          <ProductVisual name={item.product.name} compact />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link href={href} className="font-heading text-2xl">
              {item.product.name}
            </Link>
            <p className="eyebrow mt-1">{item.sizeMl} ml · Eau de parfum</p>
            {!item.available && <p className="text-sm text-destructive">No longer available</p>}
          </div>
          <Price amount={item.lineTotal} />
        </div>

        <div className="flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            max={max}
            min={0}
            disabled={disabled}
            onChange={(quantity) => onQuantityChange?.(item.variantId, quantity)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={disabled}
            onClick={() => onRemove?.(item.variantId)}
          >
            <Trash2 /> Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

"use client";

import Link from "next/link";
import type { CartItemDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "../cart-item-row/cart-item-row";
import { CartSummary } from "../cart-summary/cart-summary";

interface CartViewProps {
  items: CartItemDTO[];
  itemCount: number;
  subtotal: number;
  isSignedIn?: boolean;
  isUpdating?: boolean;
  onQuantityChange?: (variantId: string, quantity: number) => void;
  onRemove?: (variantId: string) => void;
}

export function CartView({
  items,
  itemCount,
  subtotal,
  isSignedIn,
  isUpdating,
  onQuantityChange,
  onRemove,
}: CartViewProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Anything you add will appear here, on every device you sign in on."
        action={
          <Button asChild>
            <Link href="/shop">Explore the collection</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y">
        {items.map((item) => (
          <CartItemRow
            key={item.variantId}
            item={item}
            disabled={isUpdating}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </ul>
      <CartSummary itemCount={itemCount} subtotal={subtotal} isSignedIn={isSignedIn} />
    </div>
  );
}

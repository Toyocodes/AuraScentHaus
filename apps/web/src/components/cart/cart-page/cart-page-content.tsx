"use client";

import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useBag } from "@/hooks/cart";
import { getErrorMessage } from "@/hooks/helper/errors";
import { CartView } from "../cart-view/cart-view";

/** The /cart page, connected: the account bag when signed in, the browser's bag otherwise. */
export function CartPageContent() {
  const bag = useBag();

  if (bag.isPending) return <CartPageSkeleton />;
  if (bag.isError) return <QueryError error={bag.error} title="Your bag didn't load" onRetry={() => void bag.refetch()} />;

  const run = (action: Promise<void>) =>
    action.catch((error) => toast.error(getErrorMessage(error, "We couldn't update your bag.")));

  return (
    <CartView
      items={bag.cart.items}
      itemCount={bag.cart.itemCount}
      subtotal={bag.cart.subtotal}
      isSignedIn={bag.isSignedIn}
      isUpdating={bag.isUpdating}
      onQuantityChange={(variantId, quantity) => void run(bag.setQuantity(variantId, quantity))}
      onRemove={(variantId) => void run(bag.remove(variantId))}
    />
  );
}

function CartPageSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]" aria-busy>
      <div className="space-y-6">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex gap-5">
            <Skeleton className="aspect-[4/5] w-24 sm:w-28" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

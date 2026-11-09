"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CheckoutInput } from "@aurascenthaus/shared";
import { EmptyState, QueryError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses } from "@/hooks/addresses";
import { useBag } from "@/hooks/cart";
import { getErrorMessage } from "@/hooks/helper/errors";
import { queryKeys } from "@/hooks/helper/query-keys";
import { useInitializePayment } from "@/hooks/payments";
import { CheckoutForm } from "../checkout-form/checkout-form";

/**
 * /checkout, connected: the account bag and saved addresses. "Pay" creates a pending order
 * and sends the browser to Paystack's payment page. Must sit inside <RequireAuth>.
 */
export function CheckoutPageContent() {
  const queryClient = useQueryClient();
  const bag = useBag();
  const addresses = useAddresses();
  const initializePayment = useInitializePayment();

  if (bag.isPending || addresses.isPending) return <CheckoutSkeleton />;
  if (bag.isError) return <QueryError error={bag.error} title="Your bag didn't load" onRetry={() => void bag.refetch()} />;
  if (addresses.isError) {
    return <QueryError error={addresses.error} title="Your addresses didn't load" onRetry={() => void addresses.refetch()} />;
  }

  if (bag.cart.items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Add something to your bag to check out."
        action={
          <Button asChild>
            <Link href="/shop">Explore the collection</Link>
          </Button>
        }
      />
    );
  }

  const pay = async (input: CheckoutInput) => {
    try {
      const { authorizationUrl } = await initializePayment.mutateAsync(input);
      // A newly saved address should be there next time.
      if (input.saveAddress) void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      window.location.assign(authorizationUrl);
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't start the payment. Please try again."));
      // Prices or stock may have changed (e.g. "Some items are no longer available"): show the latest bag.
      void bag.refetch();
    }
  };

  const unavailable = bag.cart.items.filter((i) => !i.available);

  return (
    <div className="space-y-6">
      {unavailable.length > 0 && (
        <p role="alert" className="rounded-sm border border-destructive/40 p-4 text-sm text-destructive">
          {unavailable.map((i) => i.product.name).join(", ")}{" "}
          {unavailable.length === 1 ? "is" : "are"} no longer available.{" "}
          <Link href="/cart" className="underline">
            Remove from your bag
          </Link>{" "}
          to continue.
        </p>
      )}
      <CheckoutForm
        items={bag.cart.items}
        subtotal={bag.cart.subtotal}
        addresses={addresses.data}
        // Stays "Redirecting…" after success, while the browser leaves for Paystack.
        isPending={initializePayment.isPending || initializePayment.isSuccess}
        isSaving={bag.isSaving}
        onSubmit={pay}
      />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]" aria-busy>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

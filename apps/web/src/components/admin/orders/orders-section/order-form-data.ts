"use client";

import { useCustomers } from "@/hooks/admin/customers";
import { useSellableVariants } from "@/hooks/admin/orders";
import { useMe } from "@/hooks/auth";

/** The API accepts up to 100 per page; enough for the "Existing customer" dropdown for now. */
const CUSTOMER_LIMIT = 100;

/**
 * What the in-store order form needs: sizes with stock, customers, and the attendant's name.
 * The name is display only: the API records the signed-in admin itself.
 */
export function useOrderFormData() {
  const { data: me } = useMe();
  const variants = useSellableVariants();
  const customers = useCustomers({ limit: CUSTOMER_LIMIT });

  return {
    variants,
    customers,
    attendantName: me ? firstNameOf(me) : "",
    isPending: variants.isPending || customers.isPending,
    error: variants.error ?? customers.error,
    refetch: () => {
      void variants.refetch();
      void customers.refetch();
    },
  };
}

/** Same rule as the API's attendantFirstName: first name, or the start of the email. */
function firstNameOf(user: { name: string | null; email: string }): string {
  const first = user.name?.trim().split(/\s+/)[0];
  if (first) return first;
  const local = user.email.split("@")[0] ?? user.email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

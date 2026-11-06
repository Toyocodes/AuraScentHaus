"use client";

import { useSellableVariants } from "@/hooks/admin/orders";
import { useMe } from "@/hooks/auth";

/**
 * What the in-store order form needs: sizes with stock and the attendant's name.
 * The name is display only: the API records the signed-in admin itself.
 */
export function useOrderFormData() {
  const { data: me } = useMe();
  const variants = useSellableVariants();

  return {
    variants,
    attendantName: me ? firstNameOf(me) : "",
    isPending: variants.isPending,
    error: variants.error,
    refetch: () => void variants.refetch(),
  };
}

/** Same rule as the API's attendantFirstName: first name, or the start of the email. */
function firstNameOf(user: { name: string | null; email: string }): string {
  const first = user.name?.trim().split(/\s+/)[0];
  if (first) return first;
  const local = user.email.split("@")[0] ?? user.email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

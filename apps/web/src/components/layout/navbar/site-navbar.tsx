"use client";

import { useSignOut } from "@/components/auth/sign-in/use-sign-out";
import { useMe } from "@/hooks/auth";
import { useBag } from "@/hooks/cart";
import { useCategoryTree } from "@/hooks/categories";
import { useScentFamilies } from "@/hooks/scent-families";
import { Navbar } from "./navbar";

/** The storefront navbar, connected: the menu from the API, who is signed in, and the bag count. */
export function SiteNavbar() {
  const { data: user, isPending } = useMe();
  const { cart } = useBag();
  const { signOut } = useSignOut();
  const { data: categories } = useCategoryTree();
  const { data: scentFamilies } = useScentFamilies();

  return (
    <Navbar
      user={user ?? null}
      isUserPending={isPending}
      cartCount={cart.itemCount}
      onSignOut={signOut}
      categories={categories}
      scentFamilies={scentFamilies?.filter((s) => s.productCount > 0)}
    />
  );
}

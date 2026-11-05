"use client";

import { useSignOut } from "@/components/auth/sign-in/use-sign-out";
import { useMe } from "@/hooks/auth";
import { useBag } from "@/hooks/cart";
import { Navbar } from "./navbar";

/** The storefront navbar, connected: who is signed in, the bag count, and sign out. */
export function SiteNavbar() {
  const { data: user, isPending } = useMe();
  const { cart } = useBag();
  const { signOut } = useSignOut();

  return <Navbar user={user ?? null} isUserPending={isPending} cartCount={cart.itemCount} onSignOut={signOut} />;
}

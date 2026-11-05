"use client";

import { useSignOut } from "@/components/auth/sign-in/use-sign-out";
import { useMe } from "@/hooks/auth";
import { Navbar } from "./navbar";

/** The storefront navbar, connected: shows who is signed in and signs them out. */
export function SiteNavbar({ cartCount }: { cartCount?: number }) {
  const { data: user, isPending } = useMe();
  const { signOut } = useSignOut();

  return <Navbar user={user ?? null} isUserPending={isPending} cartCount={cartCount} onSignOut={signOut} />;
}

"use client";

import { LogOut } from "lucide-react";
import { useSignOut } from "@/components/auth";
import { useMe } from "@/hooks/auth";

/** "Sign out" in the dark admin header. Hidden until the session is known. */
export function AdminSignOut() {
  const { data: user } = useMe();
  const { signOut, isPending } = useSignOut();
  if (!user) return null;

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isPending}
      className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-espresso-foreground/70 uppercase hover:text-espresso-foreground disabled:opacity-50"
    >
      <LogOut className="size-3.5" /> Sign out
    </button>
  );
}

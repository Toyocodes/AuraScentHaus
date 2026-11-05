"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogout } from "@/hooks/auth";

/** Sign out, then go to the home page. Used by the navbar and the admin header. */
export function useSignOut() {
  const router = useRouter();
  const logout = useLogout();

  const signOut = () =>
    logout.mutate(undefined, {
      onSettled: () => {
        toast.success("You're signed out.");
        router.replace("/");
        router.refresh();
      },
    });

  return { signOut, isPending: logout.isPending };
}

"use client";

import { ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";

interface SignOutEverywhereProps {
  isPending?: boolean;
  /** Wire to `useLogoutAll().mutateAsync`, then go to "/". */
  onConfirm?: () => void | Promise<void>;
}

export function SignOutEverywhere({ isPending, onConfirm }: SignOutEverywhereProps) {
  return (
    <div className="max-w-md space-y-2 border-t pt-6">
      <p className="text-sm text-muted-foreground">Signed in on a shared or lost device?</p>
      <ConfirmDialog
        trigger={<Button variant="outline">Sign out on all devices</Button>}
        title="Sign out everywhere?"
        description="You'll be signed out on this device and every other one. Sign in again with a code from your email."
        confirmLabel="Sign out everywhere"
        isPending={isPending}
        onConfirm={onConfirm}
      />
    </div>
  );
}

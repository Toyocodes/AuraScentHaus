"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const RESEND_SECONDS = 60;

/** "Resend code" with the same 60-second cooldown the API enforces. */
export function ResendCodeButton({ onResend }: { onResend?: () => void | Promise<void> }) {
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  return (
    <Button
      variant="link"
      size="sm"
      className="px-0"
      disabled={cooldown > 0}
      onClick={async () => {
        await onResend?.();
        setCooldown(RESEND_SECONDS);
      }}
    >
      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
    </Button>
  );
}

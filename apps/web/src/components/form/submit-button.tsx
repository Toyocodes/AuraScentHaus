"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends Omit<ComponentProps<typeof Button>, "type"> {
  /** Also show the pending label while a mutation runs (pass `mutation.isPending`). */
  isPending?: boolean;
  pendingLabel?: ReactNode;
}

/** Submit button for the surrounding <Form>. It disables itself while submitting. */
export function SubmitButton({ isPending, pendingLabel = "Saving…", children, disabled, ...props }: SubmitButtonProps) {
  const { isSubmitting } = useFormState();
  const busy = isPending || isSubmitting;

  return (
    <Button type="submit" disabled={disabled || busy} {...props}>
      {busy ? pendingLabel : children}
    </Button>
  );
}

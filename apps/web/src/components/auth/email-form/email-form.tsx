"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { requestCodeSchema, type RequestCodeInput } from "@aurascenthaus/shared";
import { FormInput, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";

interface EmailFormProps {
  defaultEmail?: string;
  isPending?: boolean;
  /** A request error to show under the field (e.g. too many attempts). */
  errorMessage?: string;
  /** Wire to `useRequestCode().mutateAsync`, then go to /verify. */
  onSubmit?: (values: RequestCodeInput) => void | Promise<void>;
}

/** Step 1 of passwordless login: enter an email and get a 6-digit code. */
export function EmailForm({ defaultEmail = "", isPending, errorMessage, onSubmit }: EmailFormProps) {
  const form = useForm({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { email: defaultEmail },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit?.(values);
        } catch {
          // Shown through `errorMessage`.
        }
      })} className="space-y-4" noValidate>
        <FormInput<RequestCodeInput>
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          autoFocus
        />
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        <SubmitButton className="w-full" size="lg" isPending={isPending} pendingLabel="Sending code…">
          Continue with email
        </SubmitButton>
      </form>
    </Form>
  );
}

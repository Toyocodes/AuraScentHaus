"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { OTP_LENGTH } from "@aurascenthaus/shared";
import { SubmitButton } from "@/components/form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { otpSchema, type OtpValues } from "./otp-schema";
import { ResendCodeButton } from "./resend-code-button";

interface OtpFormProps {
  /** The address the code was sent to (from step 1). */
  email?: string;
  isPending?: boolean;
  /** Wire to `useVerifyCode().mutateAsync({ email, code })`. */
  onSubmit?: (values: OtpValues) => void | Promise<void>;
  /** Wire to `useRequestCode().mutateAsync({ email })`. */
  onResend?: () => void | Promise<void>;
}

/** Step 2 of login: type the emailed code. It submits by itself once all 6 digits are in. */
export function OtpForm({ email, isPending, onSubmit, onResend }: OtpFormProps) {
  const form = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const submit = form.handleSubmit(async (values) => onSubmit?.(values));

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-6" noValidate>
        <p className="text-center text-sm text-muted-foreground">
          We sent a {OTP_LENGTH}-digit code to{" "}
          <span className="font-medium text-foreground">{email || "your email"}</span>
        </p>

        <FormField
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <FormItem className="justify-items-center">
              <FormControl>
                <InputOTP
                  maxLength={OTP_LENGTH}
                  inputMode="numeric"
                  pattern="^\d+$"
                  autoFocus
                  disabled={isPending}
                  {...field}
                  onComplete={() => void submit()}
                >
                  <InputOTPGroup>
                    {Array.from({ length: OTP_LENGTH }, (_, i) => (
                      <InputOTPSlot key={i} index={i} className="size-11 text-lg" aria-invalid={!!fieldState.error} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />

        <SubmitButton className="w-full" size="lg" isPending={isPending} pendingLabel="Verifying…">
          Verify and sign in
        </SubmitButton>

        <div className="flex items-center justify-between text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Use a different email
          </Link>
          <ResendCodeButton onResend={onResend} />
        </div>
      </form>
    </Form>
  );
}

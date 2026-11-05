"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMe, useRequestCode } from "@/hooks/auth";
import { getErrorMessage } from "@/hooks/helper/errors";
import { safeNextPath } from "@/lib/redirect";
import { EmailForm } from "../email-form/email-form";

/**
 * Step 1 of login, connected to the API: send the code, then go to /verify.
 * `?next=` (the page that sent the visitor here) is passed along.
 * Needs a <Suspense> boundary above it (it reads the URL).
 */
export function SignInEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), "");
  const { data: user } = useMe();
  const requestCode = useRequestCode();

  // Already signed in: skip the form.
  useEffect(() => {
    if (user) router.replace(next || "/account");
  }, [user, next, router]);

  return (
    <EmailForm
      isPending={requestCode.isPending}
      errorMessage={requestCode.isError ? getErrorMessage(requestCode.error) : undefined}
      onSubmit={async ({ email }) => {
        await requestCode.mutateAsync({ email });
        const params = new URLSearchParams({ email });
        if (next) params.set("next", next);
        router.push(`/verify?${params}`);
      }}
    />
  );
}

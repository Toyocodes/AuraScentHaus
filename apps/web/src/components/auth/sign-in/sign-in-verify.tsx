"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { isAdminRole } from "@aurascenthaus/shared";
import { useRequestCode, useVerifyCode } from "@/hooks/auth";
import { useMergeCart } from "@/hooks/cart";
import { getErrorMessage } from "@/hooks/helper/errors";
import { safeNextPath } from "@/lib/redirect";
import { useGuestCart } from "@/store/guest-cart";
import { OtpForm } from "../otp-form/otp-form";

/**
 * Step 2 of login, connected to the API: check the code (the API sets the session cookie),
 * move any guest bag into the account, then go back to `?next=`.
 * Needs a <Suspense> boundary above it (it reads the URL).
 */
export function SignInVerify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const next = safeNextPath(searchParams.get("next"), "");

  const verifyCode = useVerifyCode();
  const requestCode = useRequestCode();
  const mergeCart = useMergeCart();

  // Opened /verify directly, without an email from step 1.
  useEffect(() => {
    if (!email) router.replace("/login");
  }, [email, router]);

  return (
    <OtpForm
      email={email}
      isPending={verifyCode.isPending || mergeCart.isPending || verifyCode.isSuccess}
      errorMessage={verifyCode.isError ? getErrorMessage(verifyCode.error) : undefined}
      onSubmit={async ({ code }) => {
        const { user, isNewUser } = await verifyCode.mutateAsync({ email, code });

        // Items added while signed out join the account bag. A failure here shouldn't block sign-in.
        if (useGuestCart.getState().items.length > 0) {
          await mergeCart.mutateAsync(undefined).catch(() => {
            toast.error("We couldn't move your bag items to your account. Please add them again.");
          });
        }

        toast.success(isNewUser ? "Welcome to AuraScentHaus!" : `Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}.`);
        router.replace(next || (isAdminRole(user.role) ? "/admin" : "/account"));
        router.refresh();
      }}
      onResend={async () => {
        try {
          await requestCode.mutateAsync({ email });
          toast.success("A new code is on its way.");
        } catch (error) {
          toast.error(getErrorMessage(error));
          throw error;
        }
      }}
    />
  );
}

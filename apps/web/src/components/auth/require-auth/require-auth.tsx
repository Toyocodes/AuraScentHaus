"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasPermission, type Permission } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/hooks/helper/errors";
import { useMe } from "@/hooks/auth";
import { useHasMounted } from "@/hooks/helper/useHasMounted";
import { loginUrlFor } from "@/lib/redirect";

interface RequireAuthProps {
  children: ReactNode;
  /** Also require this permission (e.g. "admin:access"). Signed-in users without it see "No access". */
  permission?: Permission;
  /** Shown while checking the session. */
  loading?: ReactNode;
}

/**
 * Renders its children only for a signed-in user (with `permission`, if given).
 * Signed-out visitors are sent to /login and brought back here afterwards.
 *
 * This guards the UI only. The API checks the session and permission on every request.
 */
export function RequireAuth({ children, permission, loading = <AuthChecking /> }: RequireAuthProps) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const { data: user, isPending, isError, error, refetch } = useMe();
  const signedOut = !isPending && !isError && user === null;

  useEffect(() => {
    if (signedOut) router.replace(loginUrlFor(window.location.pathname + window.location.search));
  }, [signedOut, router]);

  if (!hasMounted) return loading;

  if (isError) {
    return (
      <EmptyState
        title="We couldn't check your session"
        description={getErrorMessage(error)}
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    );
  }

  if (isPending || !user) return loading;

  if (permission && !hasPermission(user.role, permission)) {
    return (
      <EmptyState
        title="You don't have access to this page"
        description="Ask a super admin if you think you should."
        action={
          <Button asChild variant="outline">
            <Link href="/">Back to the store</Link>
          </Button>
        }
      />
    );
  }

  return children;
}

function AuthChecking() {
  return (
    <div className="grid min-h-[50svh] place-items-center" role="status" aria-live="polite">
      <p className="eyebrow animate-pulse">Checking your session…</p>
    </div>
  );
}

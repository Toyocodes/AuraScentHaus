"use client";

import { hasPermission, isAdminRole } from "@aurascenthaus/shared";
import type { Permission } from "./types";
import { useMe } from "./useMe";

/**
 * Role checks for showing or hiding UI. This is only for user experience:
 * the API enforces the same permissions on every request.
 *
 *   const { can } = usePermission();
 *   if (can("products:delete")) …
 */
export function usePermission() {
  const { data: user, isPending } = useMe();
  const role = user?.role ?? null;

  return {
    role,
    isPending,
    isSignedIn: Boolean(user),
    isAdmin: isAdminRole(role),
    isSuperAdmin: role === "SUPER_ADMIN",
    can: (permission: Permission) => hasPermission(role, permission),
  };
}

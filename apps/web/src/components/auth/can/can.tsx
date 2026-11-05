import type { ReactNode } from "react";
import { hasPermission, type Permission, type Role } from "@aurascenthaus/shared";

interface CanProps {
  /** The viewer's role (from `usePermission().role`). */
  role: Role | null | undefined;
  permission: Permission;
  children: ReactNode;
  /** Rendered when the role lacks the permission. */
  fallback?: ReactNode;
}

/**
 * Show UI only to roles that have a permission:
 *   <Can role={role} permission="products:delete"><DeleteButton /></Can>
 * This only hides UI. The API enforces the same rule on every request.
 */
export function Can({ role, permission, children, fallback = null }: CanProps) {
  return hasPermission(role, permission) ? children : fallback;
}

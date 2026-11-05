import type { Role } from "./roles.js";

/**
 * Every action that needs a permission. The API checks these with `requirePermission()`
 * (the real security boundary). The web app uses the same map to hide UI a role can't use.
 */
export const PERMISSIONS = [
  // Signed-in shopper (CUSTOMER)
  "cart:manage",
  "orders:read-own",
  "profile:manage",
  // Admin area
  "admin:access",
  "dashboard:view",
  "products:read",
  "products:write",
  "products:delete",
  "categories:write",
  "categories:delete",
  "orders:read",
  "orders:create",
  "orders:update",
  "customers:read",
  "customers:write",
  // Super admin only
  "users:read",
  "users:manage-roles",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const CUSTOMER_PERMISSIONS = ["cart:manage", "orders:read-own", "profile:manage"] as const satisfies readonly Permission[];

const ADMIN_PERMISSIONS = [
  ...CUSTOMER_PERMISSIONS,
  "admin:access",
  "dashboard:view",
  "products:read",
  "products:write",
  "products:delete",
  "categories:write",
  "categories:delete",
  "orders:read",
  "orders:create",
  "orders:update",
  "customers:read",
  "customers:write",
] as const satisfies readonly Permission[];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  CUSTOMER: CUSTOMER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: PERMISSIONS, // everything
};

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
}

export function hasAllPermissions(role: Role | null | undefined, permissions: readonly Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

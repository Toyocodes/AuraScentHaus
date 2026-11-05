export const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/** Roles allowed into /admin. */
export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const satisfies readonly Role[];

export function isAdminRole(role: Role | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

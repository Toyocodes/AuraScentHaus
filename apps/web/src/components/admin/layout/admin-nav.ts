import { hasPermission, type Permission, type Role } from "@aurascenthaus/shared";
import type { SideNavItem } from "@/components/layout";

export interface AdminNavItem extends SideNavItem {
  /** The link is only shown to roles with this permission. */
  permission: Permission;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true, permission: "dashboard:view" },
  { href: "/admin/products", label: "Products", permission: "products:read" },
  { href: "/admin/categories", label: "Categories", permission: "categories:write" },
  { href: "/admin/orders", label: "Orders", permission: "orders:read" },
  { href: "/admin/customers", label: "Customers", permission: "customers:read" },
  { href: "/admin/users", label: "Team & roles", permission: "users:read" },
];

/** Links this role may see. With no role (UI not connected yet), every link is shown. */
export function adminNavFor(role?: Role | null): AdminNavItem[] {
  return role ? ADMIN_NAV.filter((item) => hasPermission(role, item.permission)) : ADMIN_NAV;
}

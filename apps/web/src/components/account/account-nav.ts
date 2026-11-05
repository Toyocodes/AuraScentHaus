import type { SideNavItem } from "@/components/layout";

export const ACCOUNT_NAV: SideNavItem[] = [
  { href: "/account", label: "Profile", exact: true },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

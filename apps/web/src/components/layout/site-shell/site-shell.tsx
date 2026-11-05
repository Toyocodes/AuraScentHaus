import type { ReactNode } from "react";
import { Footer } from "../footer/footer";
import { SiteNavbar } from "../navbar/site-navbar";

interface SiteShellProps {
  children: ReactNode;
  /** Sample count until the cart is connected (next step: `useCart()` inside the navbar). */
  cartCount?: number;
}

/** Navbar + page + footer. The navbar reads the signed-in user itself. */
export function SiteShell({ children, cartCount }: SiteShellProps) {
  return (
    <>
      <SiteNavbar cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

import type { ComponentProps, ReactNode } from "react";
import { Footer } from "../footer/footer";
import { Navbar } from "../navbar/navbar";

interface SiteShellProps extends ComponentProps<typeof Navbar> {
  children: ReactNode;
}

/** Navbar + page + footer. Navbar props (user, cartCount) pass straight through. */
export function SiteShell({ children, ...navbar }: SiteShellProps) {
  return (
    <>
      <Navbar {...navbar} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

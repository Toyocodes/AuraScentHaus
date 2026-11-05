import type { ReactNode } from "react";
import { Footer } from "../footer/footer";
import { SiteNavbar } from "../navbar/site-navbar";

/** Navbar + page + footer. The navbar reads the signed-in user and the bag itself. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

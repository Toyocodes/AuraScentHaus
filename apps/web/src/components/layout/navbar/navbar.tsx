import Link from "next/link";
import type { UserDTO } from "@aurascenthaus/shared";
import { AccountMenu } from "./account-menu";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";
import { NAV_LINKS } from "./nav-links";

interface NavbarProps {
  user?: Pick<UserDTO, "email" | "name" | "role"> | null;
  cartCount?: number;
  onSignOut?: () => void;
  isUserPending?: boolean;
}

export function Navbar({ user = null, cartCount = 0, onSignOut, isUserPending }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-espresso py-2 text-center text-[0.6875rem] tracking-[0.28em] text-espresso-foreground/85 uppercase">
        Signature fragrances, delivered across Nigeria
      </div>
      <div className="border-b bg-background/90 backdrop-blur-md">
        <nav className="container-page grid h-18 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-1">
            <MobileMenu />
            <ul className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.8125rem] tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/" className="text-center font-heading text-xl tracking-[0.3em] uppercase sm:text-2xl">
            Aura<span className="text-gold">Scent</span>Haus
          </Link>

          <div className="flex items-center justify-end gap-1">
            <AccountMenu user={user} onSignOut={onSignOut} isPending={isUserPending} />
            <CartButton count={cartCount} />
          </div>
        </nav>
      </div>
    </header>
  );
}

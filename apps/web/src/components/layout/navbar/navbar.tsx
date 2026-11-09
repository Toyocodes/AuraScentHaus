import Link from "next/link";
import type { CategoryTreeDTO, ScentFamilyDTO, UserDTO } from "@aurascenthaus/shared";
import { AccountMenu } from "./account-menu";
import { CartButton } from "./cart-button";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";

interface NavbarProps {
  user?: Pick<UserDTO, "email" | "name" | "role"> | null;
  cartCount?: number;
  onSignOut?: () => void;
  isUserPending?: boolean;
  categories?: CategoryTreeDTO[];
  scentFamilies?: ScentFamilyDTO[];
}

/** Two rows on desktop: the logo stays centred, and the full menu gets its own line below it. */
export function Navbar({ user = null, cartCount = 0, onSignOut, isUserPending, categories = [], scentFamilies = [] }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-espresso py-2 text-center text-[0.6875rem] tracking-[0.28em] text-espresso-foreground/85 uppercase">
        Signature fragrances, delivered across Nigeria
      </div>
      <div className="relative border-b bg-background/95 backdrop-blur-md">
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center">
            <MobileMenu categories={categories} scentFamilies={scentFamilies} />
          </div>

          <Link href="/" className="text-center font-heading text-lg tracking-[0.22em] uppercase sm:text-2xl sm:tracking-[0.3em]">
            Aura<span className="text-gold">Scent</span>Haus
          </Link>

          <div className="flex items-center justify-end gap-1">
            <AccountMenu user={user} onSignOut={onSignOut} isPending={isUserPending} />
            <CartButton count={cartCount} />
          </div>
        </div>

        <div className="hidden justify-center border-t md:flex">
          <MegaMenu categories={categories} scentFamilies={scentFamilies} />
        </div>
      </div>
    </header>
  );
}

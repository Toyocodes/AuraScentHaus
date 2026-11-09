import Link from "next/link";
import { FooterShopLinks } from "./footer-shop-links";

const COLUMNS = [
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/shipping", label: "Shipping and delivery" },
      { href: "/returns", label: "Returns and refunds" },
      { href: "/about", label: "About us" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/account/orders", label: "My orders" },
      { href: "/account/addresses", label: "Addresses" },
      { href: "/cart", label: "Your bag" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-espresso text-espresso-foreground">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4 sm:col-span-2 lg:col-span-1">
          <p className="font-heading text-2xl tracking-[0.3em] uppercase">
            Aura<span className="text-gold">Scent</span>Haus
          </p>
          <p className="text-sm leading-relaxed text-espresso-foreground/70">
            The art of scent. Fragrance for you and your home, composed with rare oud, rose, cedar and amber. Sign in
            with just your email: your bag follows you on every device.
          </p>
        </div>
        <nav className="space-y-4" aria-label="Shop">
          <p className="text-[0.6875rem] tracking-[0.3em] text-gold uppercase">Shop</p>
          <FooterShopLinks />
        </nav>
        {COLUMNS.map((col) => (
          <nav key={col.title} className="space-y-4">
            <p className="text-[0.6875rem] tracking-[0.3em] text-gold uppercase">{col.title}</p>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-espresso-foreground/75 transition-colors hover:text-espresso-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-espresso-foreground/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-espresso-foreground/55 sm:flex-row sm:justify-between">
          <p>© AuraScentHaus. All rights reserved.</p>
          <nav aria-label="Policies" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-espresso-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-espresso-foreground">
              Terms
            </Link>
            <span>Payments secured by Paystack</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}

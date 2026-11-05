import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All perfumes" },
      { href: "/collections/floral", label: "Floral" },
      { href: "/collections/woody", label: "Woody" },
      { href: "/collections/oud", label: "Oud" },
      { href: "/collections/fresh", label: "Fresh" },
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
      <div className="container-page grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <p className="font-heading text-2xl tracking-[0.3em] uppercase">
            Aura<span className="text-gold">Scent</span>Haus
          </p>
          <p className="text-sm leading-relaxed text-espresso-foreground/70">
            Signature perfumes composed with rare oud, rose, cedar and amber. Sign in with just your email: your
            bag follows you on every device.
          </p>
        </div>
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
          <p>Payments secured by Paystack</p>
        </div>
      </div>
    </footer>
  );
}

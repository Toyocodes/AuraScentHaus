import { ACCOUNT_NAV } from "@/components/account";
import { SideNav, SiteShell } from "@/components/layout";
import { mockCart, mockUser } from "@/mocks";

/** Sample data for now. Later: `useMe()` / `useCart()`, and send signed-out visitors to /login. */
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <SiteShell user={mockUser} cartCount={mockCart.itemCount}>
      <div className="container-page grid gap-10 py-16 md:grid-cols-[14rem_1fr] lg:gap-16">
        <aside className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow text-gold">My account</p>
            <p className="font-heading text-3xl">{mockUser.name ?? "Welcome"}</p>
          </div>
          <SideNav items={ACCOUNT_NAV} />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </SiteShell>
  );
}

import { ACCOUNT_NAV, AccountGreeting } from "@/components/account";
import { RequireAuth } from "@/components/auth";
import { SideNav, SiteShell } from "@/components/layout";
import { mockCart } from "@/mocks";

/** Signed-in customers only. The bag count is sample data until the cart is connected. */
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <SiteShell cartCount={mockCart.itemCount}>
      <RequireAuth>
        <div className="container-page grid gap-10 py-16 md:grid-cols-[14rem_1fr] lg:gap-16">
          <aside className="space-y-6">
            <AccountGreeting />
            <SideNav items={ACCOUNT_NAV} />
          </aside>
          <section className="min-w-0">{children}</section>
        </div>
      </RequireAuth>
    </SiteShell>
  );
}

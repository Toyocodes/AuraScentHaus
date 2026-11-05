import { SiteShell } from "@/components/layout";
import { mockCart } from "@/mocks";

/** The navbar shows the real signed-in user. The bag count is sample data until the cart is connected. */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <SiteShell cartCount={mockCart.itemCount}>
      {children}
    </SiteShell>
  );
}

import { SiteShell } from "@/components/layout";
import { mockCart, mockUser } from "@/mocks";

/** Sample data for now. Later: `useMe()` for the user and `useCart()` for the count. */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <SiteShell user={mockUser} cartCount={mockCart.itemCount}>
      {children}
    </SiteShell>
  );
}

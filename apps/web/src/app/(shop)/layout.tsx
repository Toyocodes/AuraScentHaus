import { SiteShell } from "@/components/layout";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}

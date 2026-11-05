import type { Metadata } from "next";
import { AdminFrame, AdminHeader } from "@/components/admin/layout";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

/**
 * RBAC: <AdminFrame> shows the admin area only to roles with "admin:access" and hides links
 * the role can't use. The real boundary is the API, which checks a permission on every /api/admin route.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-svh flex-col">
      <AdminHeader />
      <AdminFrame>{children}</AdminFrame>
    </div>
  );
}

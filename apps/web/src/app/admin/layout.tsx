import type { Metadata } from "next";
import { AdminHeader, AdminSidebar } from "@/components/admin/layout";
import { mockUser } from "@/mocks";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

/**
 * RBAC: the API checks a permission on every /api/admin route (the real boundary).
 * Sample data for now. Later: pass `usePermission().role` to <AdminSidebar> and send
 * people without "admin:access" away.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-svh flex-col">
      <AdminHeader />
      <div className="grid flex-1 md:grid-cols-[15rem_1fr]">
        <AdminSidebar role={mockUser.role} name={mockUser.name} />
        <main className="min-w-0 p-5 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

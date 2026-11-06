import type { Metadata } from "next";
import { RolePermissions, UsersSection } from "@/components/admin/users";
import { PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "Team & roles" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <PageHeader
          eyebrow="People"
          title="Team & roles"
          description="Changing someone's role signs them out everywhere, so the new role applies from their next sign-in."
        />
        <UsersSection />
      </section>

      <section className="space-y-6">
        <PageHeader as="h2" title="What each role can do" />
        <RolePermissions />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { RolePermissions, UsersTable } from "@/components/admin/users";
import { PageHeader, SearchForm } from "@/components/common";
import { mockTeam, mockUser } from "@/mocks";

export const metadata: Metadata = { title: "Team & roles" };

/** Super admin only (the API requires "users:read" / "users:manage-roles"). Later: `useUsers()` + `useUpdateUserRole()`. */
export default function AdminUsersPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <PageHeader
          eyebrow="People"
          title="Team & roles"
          description="Changing someone's role signs them out everywhere, so the new role applies from their next sign-in."
        />
        <SearchForm placeholder="Search by email or name…" className="max-w-sm" />
        <UsersTable users={mockTeam} currentUserId={mockUser.id} />
      </section>

      <section className="space-y-6">
        <PageHeader as="h2" title="What each role can do" />
        <RolePermissions />
      </section>
    </div>
  );
}

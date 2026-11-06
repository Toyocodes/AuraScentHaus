"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, Pagination, QueryError, SearchForm } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateUserRole, useUsers } from "@/hooks/admin/users";
import { useMe, usePermission } from "@/hooks/auth";
import { toastFailure } from "@/lib/toast-failure";
import { UsersTable } from "../users-table/users-table";

const PAGE_SIZE = 20;

/** /admin/users, connected. Super admins only: the API requires "users:read" and "users:manage-roles". */
export function UsersSection() {
  const { data: me } = useMe();
  const { can } = usePermission();
  const allowed = can("users:read");

  if (!allowed) {
    return <EmptyState title="Super admins only" description="Ask a super admin to change someone's role." />;
  }

  return <UsersList currentUserId={me?.id} />;
}

function UsersList({ currentUserId }: { currentUserId?: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const users = useUsers({ search: search || undefined, page, limit: PAGE_SIZE });
  const updateRole = useUpdateUserRole();

  return (
    <>
      <SearchForm
        placeholder="Search by email or name…"
        className="max-w-sm"
        onSearch={(text) => {
          setSearch(text);
          setPage(1);
        }}
      />
      {users.isPending ? (
        <Skeleton className="h-64" />
      ) : users.isError ? (
        <QueryError error={users.error} onRetry={() => void users.refetch()} />
      ) : (
        <>
          <UsersTable
            users={users.data.data}
            currentUserId={currentUserId}
            isPending={updateRole.isPending}
            onRoleChange={(userId, role) =>
              updateRole.mutate(
                { userId, role },
                {
                  onSuccess: () => toast.success("Role updated. They've been signed out everywhere."),
                  onError: toastFailure("We couldn't change this role."),
                },
              )
            }
          />
          <Pagination page={users.data.meta.page} totalPages={users.data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}

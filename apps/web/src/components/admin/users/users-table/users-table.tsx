"use client";

import type { Role, UserDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleSelect } from "../role-select/role-select";

interface UsersTableProps {
  users: UserDTO[];
  /** Your own row is locked, so you can't remove your own access by accident. */
  currentUserId?: string;
  isPending?: boolean;
  /** Wire to `useUpdateUserRole().mutate({ userId, role })`. */
  onRoleChange?: (userId: string, role: Role) => void;
}

export function UsersTable({ users, currentUserId, isPending, onRoleChange }: UsersTableProps) {
  if (users.length === 0) return <EmptyState title="No users found" className="py-8" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-48">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">{u.email}</TableCell>
            <TableCell>{u.name ?? "None"}</TableCell>
            <TableCell>
              <RoleSelect
                value={u.role}
                disabled={isPending || u.id === currentUserId}
                onChange={(role) => onRoleChange?.(u.id, role)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

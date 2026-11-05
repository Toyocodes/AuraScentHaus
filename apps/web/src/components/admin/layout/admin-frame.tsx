"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth";
import { useMe } from "@/hooks/auth";
import { AdminSidebar } from "./admin-sidebar";

/**
 * The admin area below the header: only for roles with "admin:access" (ADMIN, SUPER_ADMIN).
 * The sidebar shows only the links the viewer's role may use.
 */
export function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <RequireAuth permission="admin:access">
      <AdminFrameInner>{children}</AdminFrameInner>
    </RequireAuth>
  );
}

function AdminFrameInner({ children }: { children: ReactNode }) {
  const { data: user } = useMe();

  return (
    <div className="grid flex-1 md:grid-cols-[15rem_1fr]">
      <AdminSidebar role={user?.role} name={user?.name ?? user?.email} />
      <main className="min-w-0 p-5 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}

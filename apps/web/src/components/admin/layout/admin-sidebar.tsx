import type { Role } from "@aurascenthaus/shared";
// Straight from its file: the layout index also exports SiteShell, which loads data on the server.
import { SideNav } from "@/components/layout/side-nav/side-nav";
import { humanize } from "@/lib/format";
import { adminNavFor } from "./admin-nav";

interface AdminSidebarProps {
  /** The viewer's role: hides links they can't use (e.g. "Team & roles" for ADMIN). */
  role?: Role | null;
  name?: string | null;
}

export function AdminSidebar({ role, name }: AdminSidebarProps) {
  return (
    <aside className="space-y-6 border-b bg-sidebar p-4 md:border-r md:border-b-0 md:p-5">
      {name && (
        <div className="hidden space-y-1 md:block">
          <p className="font-heading text-xl">{name}</p>
          {role && <p className="eyebrow">{humanize(role)}</p>}
        </div>
      )}
      <SideNav items={adminNavFor(role)} />
    </aside>
  );
}

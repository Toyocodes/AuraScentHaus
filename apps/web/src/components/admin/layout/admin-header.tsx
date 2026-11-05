import Link from "next/link";
import { AdminSignOut } from "./admin-sign-out";

export function AdminHeader() {
  return (
    <header className="border-b bg-espresso text-espresso-foreground">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/admin" className="font-heading text-lg tracking-[0.3em] uppercase">
          Aura<span className="text-gold">Scent</span>Haus{" "}
          <span className="ml-2 text-[0.625rem] tracking-[0.3em] text-espresso-foreground/60">Admin</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xs tracking-[0.2em] text-espresso-foreground/70 uppercase hover:text-espresso-foreground">
            View store →
          </Link>
          <AdminSignOut />
        </div>
      </div>
    </header>
  );
}

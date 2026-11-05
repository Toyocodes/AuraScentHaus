"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { hasPermission, type UserDTO } from "@aurascenthaus/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountMenuProps {
  /** null = signed out (shows "Sign in"). */
  user: Pick<UserDTO, "email" | "name" | "role"> | null;
  onSignOut?: () => void;
  /** Still checking the session: show a quiet placeholder instead of flashing "Sign in". */
  isPending?: boolean;
}

export function AccountMenu({ user, onSignOut, isPending }: AccountMenuProps) {
  if (isPending) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Account">
        <User className="opacity-40" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.name ?? user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">
            <Package /> Orders
          </Link>
        </DropdownMenuItem>
        {hasPermission(user.role, "admin:access") && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard /> Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

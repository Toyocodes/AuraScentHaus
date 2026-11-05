"use client";

import { ROLES, type Role } from "@aurascenthaus/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { humanize } from "@/lib/format";

interface RoleSelectProps {
  value: Role;
  disabled?: boolean;
  onChange?: (role: Role) => void;
}

export function RoleSelect({ value, disabled, onChange }: RoleSelectProps) {
  return (
    <Select value={value} disabled={disabled} onValueChange={(role) => onChange?.(role as Role)}>
      <SelectTrigger className="w-full" aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {humanize(r)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { Check, Minus } from "lucide-react";
import { hasPermission, PERMISSIONS, ROLES } from "@aurascenthaus/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { humanize } from "@/lib/format";

/**
 * What each role can do, generated from ROLE_PERMISSIONS in packages/shared,
 * so it always matches what the API enforces.
 */
export function RolePermissions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Permission</TableHead>
          {ROLES.map((r) => (
            <TableHead key={r} className="text-center">
              {humanize(r)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PERMISSIONS.map((p) => (
          <TableRow key={p}>
            <TableCell className="font-mono text-xs">{p}</TableCell>
            {ROLES.map((r) => (
              <TableCell key={r} className="text-center">
                {hasPermission(r, p) ? (
                  <Check className="mx-auto size-4" aria-label="Allowed" />
                ) : (
                  <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not allowed" />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

"use client";

import type { AdminCreateCustomerInput, UserDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { CustomerDialog } from "../customer-dialog/customer-dialog";

export interface CustomerRow extends UserDTO {
  paidOrders: number;
}

interface CustomersTableProps {
  customers: CustomerRow[];
  /** From `usePermission().can("customers:write")`. */
  canEdit?: boolean;
  isSaving?: boolean;
  /** Wire to `useUpdateCustomer().mutateAsync({ customerId, input })`. */
  onUpdate?: (customerId: string, input: AdminCreateCustomerInput) => void | Promise<void>;
}

export function CustomersTable({ customers, canEdit = true, isSaving, onUpdate }: CustomersTableProps) {
  if (customers.length === 0) {
    return <EmptyState title="No customers yet" description="Shoppers appear here after their first sign-in, or add one yourself." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Paid orders</TableHead>
          {canEdit && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.email}</TableCell>
            <TableCell>{c.name ?? "–"}</TableCell>
            <TableCell className="text-muted-foreground">{c.phone ?? "–"}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
            <TableCell className="text-right tabular-nums">{c.paidOrders}</TableCell>
            {canEdit && (
              <TableCell className="text-right">
                <CustomerDialog
                  customer={c}
                  isPending={isSaving}
                  onSubmit={(input) => onUpdate?.(c.id, input)}
                  trigger={
                    <Button size="xs" variant="ghost">
                      Edit
                    </Button>
                  }
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

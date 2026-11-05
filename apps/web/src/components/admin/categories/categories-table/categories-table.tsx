"use client";

import type { CategoryDTO } from "@aurascenthaus/shared";
import { ConfirmDialog, EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface CategoryRow extends CategoryDTO {
  productCount: number;
}

interface CategoriesTableProps {
  categories: CategoryRow[];
  /** From `usePermission().can("categories:delete")`. */
  canDelete?: boolean;
  /** Wire to `useDeleteCategory().mutate(categoryId)`. */
  onDelete?: (categoryId: string) => void | Promise<void>;
}

export function CategoriesTable({ categories, canDelete = true, onDelete }: CategoriesTableProps) {
  if (categories.length === 0) {
    return <EmptyState title="No categories yet" description="Add one above, e.g. Floral, Woody or Oud." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Products</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell className="text-muted-foreground">/collections/{c.slug}</TableCell>
            <TableCell>{c.productCount}</TableCell>
            <TableCell className="text-right">
              {canDelete && (
                <ConfirmDialog
                  trigger={
                    <Button size="xs" variant="ghost">
                      Delete
                    </Button>
                  }
                  title={`Delete ${c.name}?`}
                  description="Its products stay in the store, just without a category."
                  confirmLabel="Delete category"
                  destructive
                  onConfirm={() => onDelete?.(c.id)}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

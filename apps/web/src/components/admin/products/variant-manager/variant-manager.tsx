"use client";

import type { UpdateVariantInput, VariantDTO, VariantInput } from "@aurascenthaus/shared";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddVariantForm } from "./add-variant-form";
import { VariantRow } from "./variant-row";

export interface VariantManagerProps {
  variants: VariantDTO[];
  isPending?: boolean;
  onAdd?: (input: VariantInput) => void | Promise<void>;
  onUpdate?: (variantId: string, input: UpdateVariantInput) => void | Promise<void>;
  onDelete?: (variantId: string) => void | Promise<void>;
}

/** Sizes, prices and stock of an existing product. Prices are typed in naira. */
export function VariantManager({ variants, isPending, onAdd, onUpdate, onDelete }: VariantManagerProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price (₦)</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((v) => (
            <VariantRow key={v.id} variant={v} disabled={isPending} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
      <AddVariantForm isPending={isPending} onSubmit={onAdd} />
    </div>
  );
}
